module.exports = function(eleventyConfig) {
  // Passthrough for CSS and favicon files
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};