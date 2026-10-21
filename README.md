# Groundation

An independent, tracking-free guide to Rastafari. A static website: no database, no accounts, no analytics.

## Put it online (the quick way)

1. Go to app.netlify.com/drop.
2. Drag the `_site` folder onto the page. Your site is live in under a minute.
3. In Netlify, add your own domain if you have one.

The `_headers` file inside `_site` tells Netlify to block every outside connection except YouTube videos a visitor chooses to play.

## Before you launch

Open `src/_data/site.json` and change:

- `url` to your real web address (used for Google and social previews)
- `email` to your real contact address

Also change the address in `src/robots.txt`. Then rebuild (see below).

## Editing content without code

| To change… | Edit this file |
|---|---|
| Chapter text | `src/chapters/01-roots.md` … `11-quiz.md` (plain text with `**bold**` and `*italic*`) |
| Timeline events | `src/_data/timeline.json` |
| Mansions | `src/_data/mansions.json` |
| Iyaric words | `src/_data/words.json` |
| Map places | `src/_data/places.json` |
| Debates | `src/_data/debates.json` |
| Reasonings of the day | `src/_data/reasonings.json` |
| Quiz questions | `src/_data/quiz.json` (`answer` counts from 0) |
| Share-card facts | `src/_data/facts.json` |
| Videos | `src/_data/videos.json` |
| Photo captions and credits | `src/_data/images.json` |
| Policies | `src/pages/*.md` |

### Add an article

1. Copy `src/articles/_TEMPLATE.md` and rename it, for example `src/articles/shashamane-today.md`.
2. Fill in the title, date and summary at the top. Delete the `draft` and `permalink` lines.
3. Write the article below the line. It appears automatically on the Articles page, the home page and the sitemap.

### Add a YouTube video

1. Add an entry to `src/_data/videos.json` with a short name, the YouTube ID (the part after `v=`), a title, the channel name and a one-line note.
2. Write `{% video "short-name" %}` wherever you want it in a chapter or article.

Videos never load until the visitor presses play.

### Add a photo

1. Save the image as `src/assets/img/short-name.webp` (or `.jpg`), ideally about 1600px wide.
2. Add `short-name` to `src/_data/images.json` with a description (`alt`), a caption and the credit.
3. Write `{% photo "short-name" %}` where you want it.

## Rebuilding after edits

You need Node.js installed once.

```
npm install
npm run build     # makes the _site folder
npm start         # preview at http://localhost:8080 while you edit
```

If you connect this folder to GitHub and link it to Netlify, it rebuilds automatically every time you save a change on GitHub, including edits made in GitHub's web editor.

## Still to do

- **Coronation photo:** Wikimedia was rate-limiting downloads, so the Roots chapter uses a typographic date card for now.
- **Check two licences:** the Empress Menen photo is from Wikimedia Commons; confirm its licence on its Commons page before commercial use.
- **Expert review:** have a Rastafari scholar or elder read every chapter.
- **Original voices:** recorded interviews with elders from different Mansions would make the site truly unique.
