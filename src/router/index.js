import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/definedata',
      component: () => import('../views/DataDefine.vue')
    },
    {
      path: '/preview',
      component: () => import('../views/PreviewMail.vue')
    },
    {
      path: '/editor',
      component: () => import('../views/Editor.vue')
    }
  ]
})

export default router
