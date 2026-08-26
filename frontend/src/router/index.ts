import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    component: () => import('../components/AppLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('../views/Home.vue') },
      { path: 'materials', name: 'MaterialList', component: () => import('../views/MaterialList.vue') },
      { path: 'materials/:id', name: 'MaterialDetail', component: () => import('../views/MaterialDetail.vue') },
      { path: 'space', name: 'PersonalSpace', component: () => import('../views/PersonalSpace.vue'), meta: { auth: true } },
      { path: 'ai-chat', name: 'AiChat', component: () => import('../views/AiChat.vue'), meta: { auth: true } },
    ],
  },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (to.meta.auth) {
    const auth = useAuthStore();
    if (!auth.token) return { name: 'Login' };
  }
});

export default router;
