// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/ws",
    createProxyMiddleware({
      target: "https://stressbackend.shop",
      ws: true,
      changeOrigin: true,
    })
  );
};
