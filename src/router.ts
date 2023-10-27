import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/Home.vue'),
  },

]
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})
export default router
