module.exports = {
  baseUrl: process.env.CDN ? process.env.CDN : '/',
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      alias: { vue$: 'vue/dist/vue.esm.js' }
    }
  }
}
