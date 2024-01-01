import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/steps',
      component: () => import('../views/Steps/index.vue'),
      children: [
        {
          path: 'definedata',
          component: () => import('../views/DataDefine.vue')
        },
        {
          path: 'preview',
          component: () => import('../views/PreviewMail.vue')
        },
        {
          path: 'editor',
          component: () => import('../views/EditorPage/index.vue')
        },
      ]
    },
    {
      path: "/setting",
      component: () => import('../views/SettingPage.vue')
    },
    {
      path: '/about',
      component: () => import('../views/AboutPage.vue')
    }
  ]
})

export default router
