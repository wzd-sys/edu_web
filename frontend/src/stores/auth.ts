import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const user = ref<UserInfo | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  async function register(username: string, email: string, password: string) {
    const res = await api.post('/auth/register', { username, email, password });
    token.value = res.data.token;
    user.value = res.data.user;
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  }

  async function login(account: string, password: string) {
    const res = await api.post('/auth/login', { account, password });
    token.value = res.data.token;
    user.value = res.data.user;
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, register, login, logout };
});
