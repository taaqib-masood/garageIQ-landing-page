#!/usr/bin/env python3
"""Check static marketing HTML, crawl endpoints, local assets and JS syntax.

Usage: python3 scripts/seo_check.py [--root REPOSITORY] [--json]
This is a local release gate, not a ranking, rendered-page or schema semantics audit.
"""
import argparse
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import unquote, urljoin, urlsplit
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET


ORIGIN = "https://www.garageiq.ae"
LOCAL_HOSTS = {"www.garageiq.ae", "garageiq.ae"}
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.titles, self.descriptions, self.canonicals = [], [], []
        self.ids, self.references, self.schemas = [], [], []
        self.noindex = False
        self.in_title = self.in_schema = False
        self.schema = ""
        self.feed(source)
        self.close()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "a" and attrs.get("name") and attrs["name"] != attrs.get("id"):
            self.ids.append(attrs["name"])
        if tag == "title":
            self.in_title = True
            self.titles.append("")
        if tag == "meta":
            name = attrs.get("name", "").lower()
            content = attrs.get("content", "")
            if name == "description":
                self.descriptions.append(content.strip())
            if name in {"robots", "googlebot", "bingbot"}:
                self.noindex |= "noindex" in re.split(r"[\s,]+", content.lower())
            if attrs.get("property") == "og:image" or name == "twitter:image":
                self.references.append(("meta", "image", content))
        if tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
            self.canonicals.append(attrs.get("href", ""))
        for attribute in ("href", "src", "poster", "action"):
            if attrs.get(attribute):
                self.references.append((tag, attribute, attrs[attribute]))
        if attrs.get("srcset") and not attrs["srcset"].lstrip().startswith("data:"):
            for candidate in attrs["srcset"].split(","):
                if candidate.strip():
                    self.references.append((tag, "srcset", candidate.split()[0]))
        if tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self.in_schema = True
            self.schema = ""

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_schema:
            self.schemas.append(self.schema)
            self.in_schema = False

    def handle_data(self, data):
        if self.in_title:
            self.titles[-1] += data
        if self.in_schema:
            self.schema += data


def page_url(path, public):
    relative = path.relative_to(public).as_posix()
    return ORIGIN + "/" + (relative[:-10] if relative.endswith("index.html") else relative)


def schema_types(value):
    if isinstance(value, dict):
        kind = value.get("@type", [])
        yield from ([kind] if isinstance(kind, str) else kind if isinstance(kind, list) else [])
        for item in value.values():
            yield from schema_types(item)
    elif isinstance(value, list):
        for item in value:
            yield from schema_types(item)


def reject_json_constant(value):
    raise ValueError(f"nonstandard JSON constant {value}")


def check_site(root):
    public = (Path(root).resolve() / "public").resolve()
    errors = []
    pages = {path.resolve(): Page(path.read_text(encoding="utf-8"))
             for path in public.rglob("*.html")}
    if public / "index.html" not in pages:
        return ["public/index.html: missing local homepage"]
    if pages[public / "index.html"].noindex:
        errors.append("index.html: homepage must remain indexable (noindex present)")
    indexable = {path: page for path, page in pages.items() if not page.noindex}
    expected_urls = {page_url(path, public) for path in indexable}
    titles, descriptions = {}, {}

    def reference(source, base_url, tag, attribute, value):
        resolved = urlsplit(urljoin(base_url, value))
        if resolved.scheme not in {"http", "https"} or resolved.hostname not in LOCAL_HOSTS:
            return
        # Vercel injects this endpoint at deployment; it is not a repository asset.
        if tag == "script" and attribute == "src" and resolved.path == "/_vercel/insights/script.js":
            return
        target = (public / unquote(resolved.path).lstrip("/")).resolve()
        if not target.is_relative_to(public):
            errors.append(f"{source}: local URL escapes public/: {value}")
            return
        if target.is_dir():
            target /= "index.html"
        if not target.is_file():
            errors.append(f"{source}: missing local {attribute} target: {value}")
        elif resolved.fragment and target in pages and unquote(resolved.fragment) not in pages[target].ids:
            errors.append(f"{source}: missing fragment: {value}")

    for path, page in pages.items():
        label, url = str(path.relative_to(public)), page_url(path, public)
        if path in indexable:
            for name, values, seen in (("title", page.titles, titles),
                                       ("description", page.descriptions, descriptions)):
                if len(values) != 1 or not values[0].strip():
                    errors.append(f"{label}: requires exactly one nonempty {name}")
                else:
                    text = " ".join(values[0].split()).casefold()
                    if text in seen:
                        errors.append(f"{label}: duplicate {name} with {seen[text]}")
                    seen[text] = label
            if page.canonicals != [url]:
                errors.append(f"{label}: canonical must be exactly {url}")
        for identifier, count in Counter(page.ids).items():
            if count > 1:
                errors.append(f"{label}: duplicate id/anchor {identifier}")
        types = set()
        for source in page.schemas:
            try:
                data = json.loads(source, parse_constant=reject_json_constant)
                documents = data if isinstance(data, list) else [data]
                if not documents or any(not isinstance(item, dict) or item.get("@context") not in
                                        {"https://schema.org", "https://schema.org/", "http://schema.org", "http://schema.org/"}
                                        for item in documents):
                    raise ValueError("requires Schema.org object(s) with @context")
                found = set(schema_types(data))
                if not found:
                    raise ValueError("missing @type")
                types.update(found)
            except (ValueError, TypeError) as error:
                errors.append(f"{label}: invalid JSON-LD: {error}")
        if path == public / "index.html" and not {"Organization", "WebSite"}.issubset(types):
            errors.append(f"{label}: JSON-LD requires Organization and WebSite")
        for tag, attribute, value in page.references:
            reference(label, url, tag, attribute, value)

    robots_path = public / "robots.txt"
    try:
        robots_text = robots_path.read_text(encoding="utf-8")
        robot = RobotFileParser()
        robot.parse(robots_text.splitlines())
        sitemap_values = [line.split(":", 1)[1].strip() for line in robots_text.splitlines()
                          if line.lower().startswith("sitemap:")]
        if sitemap_values != [ORIGIN + "/sitemap.xml"]:
            errors.append("robots.txt: expected one canonical sitemap URL")
        for url in sorted(expected_urls):
            if any(not robot.can_fetch(bot, url) for bot in ("*", "Googlebot", "bingbot")):
                errors.append(f"robots.txt: blocks indexable URL {url}")
    except OSError as error:
        errors.append(f"robots.txt: {error}")

    try:
        sitemap = ET.parse(public / "sitemap.xml").getroot()
        if sitemap.tag != f"{{{SITEMAP_NS}}}urlset":
            raise ValueError("expected sitemap urlset namespace")
        entries = sitemap.findall(f"{{{SITEMAP_NS}}}url")
        if any(len(entry.findall(f"{{{SITEMAP_NS}}}loc")) != 1 for entry in entries):
            errors.append("sitemap.xml: each URL entry requires exactly one loc")
        urls = [(element.text or "").strip() for element in sitemap.findall(f"{{{SITEMAP_NS}}}url/{{{SITEMAP_NS}}}loc")]
        if len(urls) != len(set(urls)):
            errors.append("sitemap.xml: duplicate URLs")
        for url in sorted(expected_urls - set(urls)):
            errors.append(f"sitemap.xml: missing indexable canonical {url}")
        for url in sorted(set(urls) - expected_urls):
            errors.append(f"sitemap.xml: URL has no indexable self-canonical page: {url}")
    except (OSError, ET.ParseError, ValueError) as error:
        errors.append(f"sitemap.xml: {error}")

    # ponytail: literal CSS url()/loadScriptOnce() only; generated paths need a browser smoke test.
    for path in public.rglob("*.css"):
        for value in re.findall(r"url\(\s*([^)]*)\)", path.read_text(encoding="utf-8")):
            reference(str(path.relative_to(public)), ORIGIN + "/" + path.relative_to(public).as_posix(),
                      "css", "url", value.strip().strip("\"'"))
    for filename in ("main.js", "uae-paths.js"):
        path = public / filename
        if not path.is_file():
            errors.append(f"{filename}: missing local JavaScript file")
            continue
        for _, value in re.findall(r"loadScriptOnce\(\s*(['\"])([^'\"]+)\1", path.read_text(encoding="utf-8")):
            reference(filename, ORIGIN + "/" + filename, "script", "src", value)
        try:
            result = subprocess.run(["node", "--check", str(path)], capture_output=True, text=True, timeout=30)
            if result.returncode:
                errors.append(f"{filename}: JavaScript syntax error: {result.stderr.strip()}")
        except (OSError, subprocess.TimeoutExpired) as error:
            errors.append(f"{filename}: JavaScript syntax check unavailable: {error}")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--json", action="store_true", help="emit machine-readable status and errors")
    args = parser.parse_args()
    try:
        errors = check_site(args.root)
    except (OSError, UnicodeError, ValueError) as error:
        errors = [f"Unable to validate site: {error}"]
    if args.json:
        print(json.dumps({"ok": not errors, "errors": errors}))
    elif errors:
        print("SEO check failed:\n" + "\n".join("- " + error for error in errors))
    else:
        print("SEO check passed: metadata, JSON-LD, crawl endpoints, local links/assets and JavaScript syntax.")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
