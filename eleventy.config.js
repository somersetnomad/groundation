const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.ignores.add("src/articles/_TEMPLATE.md");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Click-to-play YouTube card. Nothing loads from YouTube until the visitor presses play. */
  eleventyConfig.addShortcode("video", function (key) {
    const videos = JSON.parse(fs.readFileSync("src/_data/videos.json", "utf8"));
    const v = videos[key];
    if (!v) return `<!-- unknown video ${esc(key)} -->`;
    return `<figure class="video" data-video="${esc(v.id)}" data-title="${esc(v.title)}">
<div class="video-frame">
<div class="video-poster" aria-hidden="true"><span class="vp-band"></span><span class="vp-title">${esc(v.title)}</span></div>
<div class="video-consent">
<button type="button" class="video-play"><span class="vp-icon" aria-hidden="true">&#9654;</span><span>Play video</span><span class="sr-only">: ${esc(v.title)}</span></button>
<p class="video-note">Playing loads YouTube, which may set cookies and collect data. <a href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener noreferrer">Watch on YouTube instead</a></p>
<label class="video-remember"><input type="checkbox" class="video-always"> Always play videos on this device</label>
</div>
</div>
<figcaption><strong>${esc(v.title)}</strong> <span>${esc(v.note)} Source: ${esc(v.channel)}.</span></figcaption>
</figure>`;
  });

  /* Photo slot: shows the image if it exists, otherwise a designed placeholder. */
  eleventyConfig.addShortcode("photo", function (slot, extraClass) {
    const imgs = JSON.parse(fs.readFileSync("src/_data/images.json", "utf8"));
    const m = imgs[slot] || { alt: slot, caption: "" };
    const exts = ["webp", "jpg", "jpeg", "png"];
    let file = null;
    for (const e of exts) if (fs.existsSync(path.join("src/assets/img", `${slot}.${e}`))) { file = `${slot}.${e}`; break; }
    const cls = `photo ${extraClass || ""}`.trim();
    const credit = m.credit ? `<span class="credit">${m.credit}</span>` : "";
    if (file) {
      return `<figure class="${cls}"><img src="/assets/img/${file}" alt="${esc(m.alt)}" loading="lazy" decoding="async"><figcaption>${esc(m.caption)} ${credit}</figcaption></figure>`;
    }
    return `<figure class="${cls} photo-pending"><div class="photo-ph" role="img" aria-label="${esc(m.alt)}"><span>${esc(m.alt)}</span></div><figcaption>${esc(m.caption)}</figcaption></figure>`;
  });


  /* Make every internal link relative so the site works when opened straight from a folder, as well as on any host. */
  eleventyConfig.addTransform("relative-links", function (content) {
    const out = this.page.outputPath;
    if (!out || !out.endsWith(".html")) return content;
    const rel = path.relative(path.dirname(out), "_site").split(path.sep).join("/");
    const prefix = rel ? rel + "/" : "";
    return content.replace(/(\s(?:href|src))="\/(?!\/)([^"#?]*)([^"]*)"/g, (m, attr, p, rest) => {
      let target = p;
      if (target === "" || target.endsWith("/")) target += "index.html";
      return `${attr}="${prefix}${target}${rest}"`;
    });
  });

  eleventyConfig.addFilter("json", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("ld", (type, name, headline, desc, url, lang, pub) => JSON.stringify({ "@context": "https://schema.org", "@type": type, name, headline, description: desc, url, inLanguage: lang, publisher: { "@type": "Organization", name: pub } }).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("numberWord", (n) => (["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen","Twenty"][n] || String(n)));
  eleventyConfig.addFilter("pad", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("absolute", (p, base) => (base || "").replace(/\/$/, "") + p);
  eleventyConfig.addFilter("dateIso", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("dateNice", (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));

  eleventyConfig.addCollection("chapters", (api) => api.getFilteredByGlob("src/chapters/*.md").sort((a, b) => a.data.order - b.data.order));
  eleventyConfig.addCollection("articles", (api) => api.getFilteredByGlob("src/articles/*.md").filter((p) => !p.data.draft).sort((a, b) => b.date - a.date));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
