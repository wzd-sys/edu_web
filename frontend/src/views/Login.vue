<template>
  <el-row justify="center" style="margin-top: 80px;">
    <el-col :span="8">
      <el-card>
        <template #header>
          <h2 style="text-align: center; margin: 0;">用户登录</h2>
        </template>
        <el-form :model="form" @submit.prevent="handleLogin" label-position="top">
          <el-form-item label="账号">
            <el-input v-model="form.account" placeholder="用户名或邮箱" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="密码（6位以上）" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%;">登录</el-button>
          </el-form-item>
          <div style="text-align: center;">
            <span style="color: #909399;">还没有账号？</span>
            <router-link to="/register" style="color: #409EFF;">立即注册</router-link>
          </div>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const form = ref({ account: '', password: '' });

async function handleLogin() {
  if (!form.value.account || !form.value.password) {
    ElMessage.warning('请填写账号和密码');
    return;
  }
  loading.value = true;
  try {
    await auth.login(form.value.account, form.value.password);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>
