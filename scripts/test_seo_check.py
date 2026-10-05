#!/usr/bin/env python3
"""Run with: python3 scripts/test_seo_check.py (stdlib only; no live writes)."""
from pathlib import Path
import shutil
import tempfile
import unittest

from seo_check import check_site


ROOT = Path(__file__).resolve().parents[1]


class SEOCheckTest(unittest.TestCase):
    def test_current_site_passes(self):
        self.assertEqual(check_site(ROOT), [])

    def test_rejects_broken_content_then_passes_after_repair(self):
        original = (ROOT / "public/index.html").read_text()
        cases = (
            ("canonical", original.replace('href="https://www.garageiq.ae/"',
                                           'href="https://www.garageiq.ae/wrong/"', 1)),
            ("JSON-LD", original.replace('"@context":', 'INVALID "@context":', 1)),
            ("missing local", original.replace("</body>",
                                               '<a href="/missing-page/">Missing</a></body>')),
            ("fragment", original.replace('href="#problem"', 'href="#missing-anchor"', 1)),
            ("description", original.replace('name="description"', 'name="unused"', 1)),
            ("title", original.replace("</title>", "</title><title>Duplicate</title>", 1)),
            ("missing local", original.replace('src="/app-dark-1.webp"',
                                               'src="/missing-image.webp"', 1)),
            ("Organization", original.replace('"@type": "Organization"',
                                               '"@type": "Thing"', 1)),
        )
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            shutil.copytree(ROOT / "public", root / "public")
            index = root / "public/index.html"
            for expected, broken in cases:
                with self.subTest(expected=expected):
                    index.write_text(broken)
                    self.assertTrue(any(expected in error for error in check_site(root)),
                                    f"Did not reject {expected}")
                    index.write_text(original)
                    self.assertEqual(check_site(root), [])

            robots = root / "public/robots.txt"
            saved = robots.read_text()
            robots.write_text(saved.replace("Allow: /", "Disallow: /"))
            self.assertTrue(any("robots" in error for error in check_site(root)))
            robots.write_text(saved)
            sitemap = root / "public/sitemap.xml"
            saved = sitemap.read_text()
            sitemap.write_text(saved.replace("https://www.garageiq.ae/</loc>",
                                              "https://www.garageiq.ae/wrong/</loc>"))
            self.assertTrue(any("sitemap" in error for error in check_site(root)))
            sitemap.write_text(saved)
            self.assertEqual(check_site(root), [])
            sitemap.write_text(saved.replace("</urlset>", "<url></url></urlset>"))
            self.assertTrue(any("sitemap" in error for error in check_site(root)))
            sitemap.write_text(saved)
            script = root / "public/main.js"
            saved = script.read_text()
            script.write_text(saved + "\nconst = syntax-error;\n")
            self.assertTrue(any("JavaScript syntax error" in error for error in check_site(root)))
            script.write_text(saved)
            self.assertEqual(check_site(root), [])

    def test_new_nested_page_must_have_self_canonical_sitemap_and_valid_links(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            shutil.copytree(ROOT / "public", root / "public")
            page = root / "public/guides/example/index.html"
            page.parent.mkdir(parents=True)
            page.write_text('''<!doctype html><html><head><title>A useful guide</title>
                <meta name="description" content="A unique useful guide description.">
                <link rel="canonical" href="https://www.garageiq.ae/guides/example/">
                <link rel="stylesheet" href="../../style.css"></head><body>
                <h1>Guide</h1><a href="/#waitlist">Join the waitlist</a></body></html>''')
            self.assertTrue(any("sitemap" in error for error in check_site(root)))
            sitemap = root / "public/sitemap.xml"
            sitemap.write_text(sitemap.read_text().replace("</urlset>",
                '<url><loc>https://www.garageiq.ae/guides/example/</loc></url></urlset>'))
            self.assertEqual(check_site(root), [])
            page.write_text(page.read_text().replace('href="/#waitlist"',
                                                    'href="/#missing-anchor"'))
            self.assertTrue(any("fragment" in error for error in check_site(root)))


if __name__ == "__main__":
    unittest.main()
