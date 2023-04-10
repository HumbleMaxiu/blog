import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "My Blog",
  description: "learn and share",
  base: '/blog/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],

    sidebar: [
      {
        text: 'Vue2',
        items: [
          { text: 'Vue2源码', link: '/Vue2/source-code' },
          { text: 'VueRouter', link: '/Vue2/vue-router' },
          { text: 'VueX', link: '/Vue2/vuex' },
          { text: 'VueCli', link: '/Vue2/vue-cli' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
