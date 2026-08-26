<template>
  <el-row justify="center" style="margin-top: 80px;">
    <el-col :span="8">
      <el-card>
        <template #header>
          <h2 style="text-align: center; margin: 0;">用户注册</h2>
        </template>
        <el-form :model="form" @submit.prevent="handleRegister" label-position="top">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="密码（至少6位）" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%;">注册</el-button>
          </el-form-item>
          <div style="text-align: center;">
            <span style="color: #909399;">已有账号？</span>
            <router-link to="/login" style="color: #409EFF;">立即登录</router-link>
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
const form = ref({ username: '', email: '', password: '' });

async function handleRegister() {
  if (!form.value.username || !form.value.email || !form.value.password) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  if (form.value.password.length < 6) {
    ElMessage.warning('密码至少6位');
    return;
  }
  loading.value = true;
  try {
    await auth.register(form.value.username, form.value.email, form.value.password);
    ElMessage.success('注册成功');
    router.push('/');
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '注册失败');
  } finally {
    loading.value = false;
  }
}
</script>
