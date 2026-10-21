---
title: "Your article title"
date: 2026-11-01
topic: History
author: Your name
summary: "One or two sentences that appear on the article list and in search results."
description: "A short description for Google (about 150 characters)."
draft: true
permalink: false
---

Write your article here in plain text.

## Use two hashes for a heading

Put **two stars** around words to make them bold, and *one star* for italics.

To add a YouTube video, first add it to src/_data/videos.json, then write:

{% raw %}{% video "your-video-name" %}{% endraw %}

To add a photo, put it in src/assets/img, describe it in src/_data/images.json, then write:

{% raw %}{% photo "your-photo-name" %}{% endraw %}

When you are ready to publish, delete the lines "draft: true" and "permalink: false" above, and rename this file (for example my-new-article.md).
