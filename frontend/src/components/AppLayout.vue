<template>
  <el-container style="min-height: 100vh">
    <el-header style="background: #409EFF; color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 24px;">
      <div style="display: flex; align-items: center; gap: 24px;">
        <h1 style="font-size: 18px; margin: 0; cursor: pointer;" @click="$router.push('/')">教材管理平台</h1>
        <el-menu mode="horizontal" :ellipsis="false" background-color="#409EFF" text-color="white" active-text-color="#ffd04b" style="border: none;">
          <el-menu-item index="/" @click="$router.push('/')">首页</el-menu-item>
          <el-menu-item index="/materials" @click="$router.push('/materials')">教材列表</el-menu-item>
          <el-menu-item index="/space" @click="$router.push('/space')" v-if="auth.token">个人空间</el-menu-item>
          <el-menu-item index="/ai-chat" @click="$router.push('/ai-chat')" v-if="auth.token">AI对话</el-menu-item>
        </el-menu>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <template v-if="auth.user">
          <span>{{ auth.user.username }}</span>
          <el-button text style="color: white;" @click="handleLogout">退出</el-button>
        </template>
        <template v-else>
          <el-button text style="color: white;" @click="$router.push('/login')">登录</el-button>
          <el-button type="warning" size="small" @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push('/');
}
</script>
