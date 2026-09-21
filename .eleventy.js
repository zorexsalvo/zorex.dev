const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

module.exports = function(eleventyConfig) {
  // Passthrough for CSS, favicon, images, and nojekyll files
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");
  eleventyConfig.addPassthroughCopy("src/slides");

  // Date filters
  eleventyConfig.addFilter("dateToISO", function(date) {
    return new Date(date).toISOString();
  });

  eleventyConfig.addFilter("readableDate", function(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  });

  eleventyConfig.addFilter("ogType", function(url) {
    return url.indexOf("/posts/") === 0 ? "article" : "website";
  });

  // Posts collection (sorted by date, newest first)
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort(function(a, b) {
      return b.date - a.date;
    });
  });

  // Personal notes collection (unlisted, not in site nav)
  eleventyConfig.addCollection("notes", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/notes/*.md").sort(function(a, b) {
      return b.date - a.date;
    });
  });

  // Unlisted slides collection
  eleventyConfig.addCollection("slides", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/slides/*.md").sort(function(a, b) {
      return b.date - a.date;
    });
  });

  // Slideshow shortcode: reads all .md files from a slide deck directory
  // and renders them as a keyboard-navigable HTML slideshow
  eleventyConfig.addShortcode("slideshow", function(deckName) {
    const md = new MarkdownIt({ html: true });
    const deckPath = path.join('src', 'slides', deckName);
    const files = fs.readdirSync(deckPath)
      .filter(f => f.endsWith('.md'))
      .sort();

    const slides = files.map(f => {
      const content = fs.readFileSync(path.join(deckPath, f), 'utf8');
      return md.render(content);
    });

    return `
    <div class="slideshow">
      ${slides.map((html, i) => `
        <div class="slide" data-index="${i}" style="display: ${i === 0 ? 'flex' : 'none'}">
          <div class="slide-content">${html}</div>
        </div>
      `).join('')}
    </div>
    <div class="slide-controls">
      <span class="slide-counter">1 / ${slides.length}</span>
    </div>
    <script>
      (function() {
        let current = 0;
        const slides = document.querySelectorAll('.slide');
        const counter = document.querySelector('.slide-counter');
        const total = slides.length;
        function show(i) {
          slides.forEach(s => s.style.display = 'none');
          slides[i].style.display = 'flex';
          counter.textContent = (i + 1) + ' / ' + total;
        }
        function goNext() { if (current < total - 1) show(++current); }
        function goPrev() { if (current > 0) show(--current); }
        document.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            goNext();
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            goPrev();
          }
        });
        document.querySelector('.slideshow').addEventListener('click', function(e) {
          var tag = e.target.tagName.toLowerCase();
          if (['a','button','input','textarea','select'].indexOf(tag) !== -1) return;
          if (e.clientX < window.innerWidth / 2) goPrev(); else goNext();
        });
      })();
    </script>
    `;
  });

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};