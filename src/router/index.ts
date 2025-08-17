import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/layout",
      component: () => import("../layouts/NormalLayout.vue"),
      redirect: "/layout/home",
      children: [
        {
          path: "home",
          component: () => import("../views/Home.vue"),
        },
        {
          path: "box/:type",
          component: () => import("../views/MailBox.vue"),
        },
        {
          path: "write",
          component: () => import("../views/Steps/index.vue"),
          redirect: "/layout/write/definedata",
          children: [
            {
              path: "definedata",
              component: () => import("../views/DataDefine.vue"),
            },
            {
              path: "preview",
              component: () => import("../views/PreviewMail.vue"),
            },
            {
              path: "editor",
              component: () => import("../views/EditorPage/index.vue"),
            },
          ],
        },
      ],
    },
    {
      path: "/setting",
      component: () => import("../views/SettingPage.vue"),
    },
    {
      path: "/about",
      component: () => import("../views/AboutPage.vue"),
    },
  ],
});

export default router;
