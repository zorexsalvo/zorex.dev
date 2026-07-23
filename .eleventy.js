module.exports = function(eleventyConfig) {
  // Passthrough for CSS files
  eleventyConfig.addPassthroughCopy("src/css");

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};