module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    // Configuration applied to all builds
  },
  pluginOptions: {
    electronBuilder: {
      
      preload: 'src/whatsapp.js',
      nodeIntegration: true,
      
    }
  }
}