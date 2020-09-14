module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    // Configuration applied to all builds
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: ['github']
      },
      
      preload: 'src/whatsapp.js',
      nodeIntegration: true,
      
    }
  }
}