module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("videos");
  eleventyConfig.addPassthroughCopy("icono");
  eleventyConfig.addPassthroughCopy("lottie");
  eleventyConfig.addPassthroughCopy("planta.png");
  eleventyConfig.addPassthroughCopy("lupa.mp4");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
