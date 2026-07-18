module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("videos");
  eleventyConfig.addPassthroughCopy("icono");
  eleventyConfig.addPassthroughCopy("lottie");
  eleventyConfig.addPassthroughCopy("planta.png");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
