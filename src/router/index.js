import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {   
    path: '/',
    name: 'Home',
    redirect: '/Mi',
  },
  {   
    path: '/Mi',
    name: 'Mi',
    component: () => import('../views/Mi.vue'),
  },
  {
    path: '/Frame',
    name: 'Frame',
    component: () => import('../views/Frame.vue'),
  },
  {
    path: '/Jamb',
    name: 'Jamb',
    component: () => import('../views/Jamb.vue'),
  },
  {
    path: '/Flag',
    name: 'Flag',
    component: () => import('../views/Flag.vue'),
  },
  {
    path: '/Gins',
    name: 'Gins',
    component: () => import('../views/Gins.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router