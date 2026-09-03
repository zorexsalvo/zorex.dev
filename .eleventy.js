module.exports = function(eleventyConfig) {
  // Passthrough for CSS, favicon, and nojekyll files
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");

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

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};