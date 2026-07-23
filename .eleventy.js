module.exports = function(eleventyConfig) {
  // Passthrough for CSS, favicon, and nojekyll files
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};