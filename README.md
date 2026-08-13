# FreshCart Admin

Back office for FreshCart — live orders, insights, products, categories, quick stock,
credit, order history, delivery staff and settings. React + Vite, installable as a PWA.

Implemented from the Claude Design project
`FreshCart Admin Dashboard.dc.html` ([7225a461](https://claude.ai/design/p/7225a461-f721-41cb-9297-5c3e31fb43a0)).

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with Oxlint |

The service worker is only registered in production builds, so use `npm run preview`
to exercise install/offline behaviour.

## Design fidelity

The source design expresses every rule as an inline CSS string. Those strings are
carried over **verbatim** and parsed into React style objects by
[`src/lib/css.js`](src/lib/css.js), so the desktop rendering is identical to the
design rather than a hand-translation of it. Two things inline styles cannot express
live in [`src/index.css`](src/index.css) instead:

- **Hover states** — the design's `style-hover` attributes, as `.hv-*` classes.
- **The responsive layer** — see below.

When changing a component, keep edits inside the CSS strings; don't convert them to
objects or utility classes.

## Responsive behaviour

Everything above 1100px renders exactly as designed. Below that, additive CSS takes
over — no markup was restructured for it.

| Breakpoint | What changes |
| --- | --- |
| ≤ 1100px | The 252px sidebar becomes an off-canvas drawer behind a header hamburger |
| ≤ 900px | Header wraps, alert banners wrap their actions, sticky save panels unstick |
| ≤ 760px | Wide data grids drop their header row and stack into labelled cards (`data-label`) |
| ≤ 640px | Display figures scale down, stock tri-state buttons split the row, order drawer goes full width |

Table cells opt into the stacked-card labels by carrying a `data-label` attribute;
identity cells (order number, customer) intentionally have none so they stay
full-width, and action cells carry `.fc-act` so their button spans the card.

## PWA

- [`public/manifest.webmanifest`](public/manifest.webmanifest) — standalone display,
  brand theme colour, any/maskable icons, plus Live Orders and Quick Stock shortcuts
  (deep-linked to `/live` and `/stock`).
- [`public/sw.js`](public/sw.js) — network-first for navigations with a cached app
  shell fallback, stale-while-revalidate for same-origin assets. Registered from
  [`src/pwa.js`](src/pwa.js) in production only; a new deployment activates on the
  next reload.
- Manrope is self-hosted in `public/fonts` so the installed app keeps its type
  offline. Regenerate with the Google Fonts CSS if the family ever changes.
- [`src/components/InstallPrompt.jsx`](src/components/InstallPrompt.jsx) renders only
  when the browser fires `beforeinstallprompt`, and sits below both drawers.

Icons are generated from `public/icons/icon.svg` and `icon-maskable.svg`:

```bash
cd public
rsvg-convert -w 192 -h 192 icons/icon.svg -o icons/icon-192.png
rsvg-convert -w 512 -h 512 icons/icon.svg -o icons/icon-512.png
rsvg-convert -w 512 -h 512 icons/icon-maskable.svg -o icons/icon-512-maskable.png
rsvg-convert -w 180 -h 180 icons/icon.svg -o icons/apple-touch-icon.png
```

## Deployment — SPA fallback is required

Routing is client-side (`react-router-dom`'s `BrowserRouter`), so every route
(`/products`, `/staff`, `/products/:id/edit`, …) only exists in the browser —
the host must serve `index.html` for any path it doesn't recognise and let the
router take it from there. Without that, a direct load, refresh, or shared
deep link on anything but `/` 404s at the host.

Already wired up here:
- **Netlify / Cloudflare Pages / Render** — [`public/_redirects`](public/_redirects)
- **Vercel** — [`vercel.json`](vercel.json)

Other hosts need the equivalent rewrite rule, e.g. nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

`public/sw.js` also falls back to the last cached shell if a navigation ever
gets a non-2xx response, so a misconfigured host degrades to a stale-but-working
shell for repeat visitors rather than a broken page — but it can't help a
visitor's very first load, so the host-level rewrite above is the real fix.

## Notes

The Vite config still wires up Tailwind from the original scaffold, but nothing
imports it — the design's own CSS strings are the styling system here.
