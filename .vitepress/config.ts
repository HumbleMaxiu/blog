import { defineConfig } from 'vitepress'
import sidebar from './router-config'

export default defineConfig({
  lang: 'en-US',
  title: "Humble Xiuma",
  description: "Home of Humble Xiuma",
  base: '/blog/',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/jpg',
        href: '/blog/cf_liu.jpg'
      }
    ],
    [
      'meta',
      {
        name: 'author',
        content: 'Humble Xiuma'
      }
    ],
    [
      "meta",
      {
        property: "og:title",
        content: "Home",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content: "Home of Humble Xiuma",
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
