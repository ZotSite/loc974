# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static landing page for **RoadTrip Réunion** — a 4x4 + rooftop tent rental service in La Réunion. Single-page, no build tool, no framework, no dependencies other than two Google Fonts.

## How to run

Open `index.html` directly in a browser. No server required — all assets are local or CDN. For a local dev server: `npx serve .` or `python -m http.server`.

## Architecture

```
index.html          ← entire page (one file, ~730 lines)
css/style.css       ← all desktop styles + component styles
css/responsive.css  ← media queries only (sm 640 / md 768 / lg 1024)
js/main.js          ← vanilla JS IIFE, no modules, no bundler
public/
  images/hero.png   ← hero background (replace with real photo)
  fonts/            ← (empty, fonts loaded via Google Fonts CDN)
  favicon.svg
```

## Design system

All tokens live in `:root` in `style.css` (direction: "Forêt Profonde"):

- `--accent: #1E4D35` — primary green
- `--bg: #F5F2EC` / `--bg-alt: #EDEADF` — warm off-whites
- `--font-serif: 'Cormorant Garamond'` — headings, hero, italic accents
- `--font-sans: 'DM Sans'` — body, UI
- `.section-title em` renders in italic accent green — preserve this pattern for all headings

## JS modules (all in `main.js` IIFE)

1. **Hero scroll parallax** — `.hero` is `320vh` tall with a sticky pin. Scroll ratio drives: overlay opacity, image zoom (1.0→1.15), and staggered reveal of `.js-hero-el` elements via `data-threshold` attribute.
2. **Scroll reveal** — `IntersectionObserver` on `.reveal` elements; adds `.visible` class. Stagger via CSS `--delay` custom property.
3. **Nav scroll state** — adds `.scrolled` to `#nav` after 60px; `activeNavLink` highlight via a second observer.
4. **Mobile menu** — burger/overlay at ≤1024px; closes on link click or Escape key.
5. **FAQ accordion** — one-open-at-a-time; `aria-expanded` managed.
6. **Contact form** — client-side validation + date constraints. Submit is currently **simulated** with `setTimeout` (no real backend). Replace the `setTimeout` block with a `fetch` to your email API or form service.

## Things to replace before going live

- Hero image: `public/images/hero.png` (placeholder)
- Spot/vehicle/testimonial images: all `picsum.photos` URLs
- WhatsApp number in `#contact`: `262XXXXXXXXX`
- Contact email: `contact@roadtripreunion.re`
- Form submit logic in `main.js` (`/* Simulation d'envoi */` block)
- Footer legal links (`#` hrefs)
