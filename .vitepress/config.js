import { defineConfig } from 'vitepress'
import sidebar from './router-config'

export default defineConfig({
  title: "My Blog",
  description: "记录中级晋升高级的学习过程",
  base: '/blog/',
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
