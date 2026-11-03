# fidankarimli.github.io

Personal research blog of Fidan Karimli, built with [Astro](https://astro.build) on the
[AstroPaper](https://github.com/satnaing/astro-paper) theme (MIT, see `LICENSE`), with a
serif text style, KaTeX math and React for interactive figures.

## Commands

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm install`     | Install dependencies                                |
| `npm run dev`     | Local dev server at http://localhost:4321           |
| `npm run build`   | Type-check, build to `dist/`, build the search index |
| `npm run preview` | Serve the built site locally                        |

## Where things are

- Posts: `src/content/posts/` (Markdown/MDX; frontmatter: `title`, `description`, `pubDatetime`, `tags`, optional `draft`, `cover` (card picture, e.g. an SVG in `src/assets/covers/`), `subtitle`)
- About page: `src/content/pages/about.md`
- Home intro and research interests: `src/pages/index.astro`
- CV / GitHub / LinkedIn / Email buttons: `src/components/ProfileLinks.astro`
- Site settings (title, socials, features): `astro-paper.config.ts`
- Fonts and text style: `src/styles/theme.css`, `src/styles/global.css`
- CV file: `public/cv.pdf`

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
