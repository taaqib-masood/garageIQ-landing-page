# GarageIQ — landing page

The public marketing site at **https://www.garageiq.ae**. This repo is *only* that
site. The product itself — the Next.js PWA, the NestJS API, the Python workers — lives
in the private `taaqib-masood/GarageIQ` repo. API changes belong there; Render builds
the API from that repo, so API code committed here would do nothing.

> This file used to be the monorepo's index, describing NestJS and Celery, because this
> repo was branched from the monorepo. None of that is here.

## Shape

Everything shipped is in `public/`. There is no build step and no dependencies.

```
public/index.html          the whole page
public/style.css           the whole stylesheet
public/main.js             the whole script
public/app-dark-*.webp     the four phone screenshots
public/uae-paths.js        UAE outline, loaded lazily with three.js
public/hanken-grotesk-latin.woff2   self-hosted variable font
build/output-config.json   headers (cache + security)
vercel.json                copies public/ to the build output
```

Local: `npm run dev` → http://localhost:8000

## Things that will bite you

**This repo is PUBLIC.** The app repo is private. Never commit an `.env`; the
`.gitignore` exists because `apps/api/.env` with live-format credentials sat here from
2026-07-18 to 2026-09-03.

**Two Supabase projects.** The waitlist writes to `zbqtaiozkhfscwynddjd`. The API uses a
different one (`sbriafdrvhibvhlyjugv`, Mumbai). Don't mix them up.

**`anon` needs schema USAGE, not just table grants.** Postgres checks schema access, then
table GRANTs, then RLS. A correct RLS policy is unreachable without the first two — that
is how the waitlist silently discarded every signup for months while showing a success
tick. Grants are column-scoped with no SELECT: keep it that way, the anon key is public.

**Nothing above the fold may depend on JavaScript to become visible.** `.mechanical-reveal
span` is `opacity: 0` until an IntersectionObserver adds `.is-visible`. The hero is
exempted (`#hero` override, animates `transform` only) because it is the LCP element —
gating it on JS cost 2196ms.

**Phone frame height is derived, not chosen.** Screenshots are 514×1024 (aspect 0.5020),
screen inner width 260px → image 518px + 20px status-bar strip + 2×10 padding = **558px**.
Re-export the screenshots at a different aspect and `object-fit: cover` silently shears
the sides. The 20px strip exists because the screenshots start with the app header at
pixel zero and carry no status bar, so the Dynamic Island would sit on the wordmark.

**`.link-hover::after` is the hover underline.** Do not add another `::after` rule
matching those elements — doing so shipped a permanent strikethrough through
"How it works".

**The map is lazy.** If it looks empty with counters at 0, three.js is still loading.
That is not a bug; give it a few seconds.

**Measuring performance:** disable the cache, or the `immutable` headers return
`transferSize: 0` and the run is meaningless. The hero is `position: sticky` and the
phone sits inside a `clip-path` reveal, so element screenshots and same-tick
`getBoundingClientRect()` both mislead — scroll, wait, then read.

## Content rules

Figures on this page have been wrong before. Don't state a garage or review count you
have not checked against the database, and don't restore the testimonials or the app
store badges — both were removed for being untrue, with the reasoning left in the
markup.

**The legal copy.** The dialog now serves a short pre-launch notice describing what the
page actually does — collect an email. It replaced an 18-section commercial Terms of Use
that had been live with 11 unfilled placeholders; that document is preserved, unrendered,
at `docs/terms-of-use.draft.md`.

Do **not** fill in its entity or counsel fields to make a placeholder disappear. The
liability cap and the Arabic precedence clause are marked for counsel by the document's
own authors, and the trade licence number, licensing authority and registered address are
registry facts about a company that is not registered yet. Inventing any of them puts a
false legal claim on a consumer site in a regulated market — the same failure as the
testimonials and the app-store badges above. Publish it when there is an entity and a
lawyer has read it, not before.

`support@garageiq.ae` and `privacy@garageiq.ae` are live and safe to use.
