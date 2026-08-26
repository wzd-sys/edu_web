<template>
  <div style="padding: 20px;">
    <el-row justify="space-between" align="middle" style="margin-bottom: 16px;">
      <h2 style="margin: 0;">个人空间</h2>
      <el-upload
        :action="''"
        :before-upload="handleUpload"
        :show-file-list="false"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.gltf,.glb"
      >
        <el-button type="primary">上传教材</el-button>
      </el-upload>
    </el-row>

    <el-dialog v-model="uploadDialogVisible" title="上传教材" width="500px">
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="uploadForm.title" />
        </el-form-item>
        <el-form-item label="学科">
          <el-select v-model="uploadForm.subject" style="width: 100%;">
            <el-option v-for="s in subjects" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="uploadForm.grade" style="width: 100%;">
            <el-option v-for="g in grades" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="uploadForm.type" style="width: 100%;">
            <el-option v-for="t in types" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="submitUpload">上传</el-button>
      </template>
    </el-dialog>

    <el-row :gutter="16" v-loading="loading">
      <el-col :span="6" v-for="m in materials" :key="m.id" style="margin-bottom: 16px;">
        <MaterialCard :material="m" @click="$router.push(`/materials/${m.id}`)">
          <template #actions>
            <el-button type="danger" size="small" text @click.stop="handleRemove(m)">删除</el-button>
          </template>
        </MaterialCard>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && materials.length === 0" description="个人空间暂无教材" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import api from '../api';
import type { Material } from '../stores/material';
import { useAuthStore } from '../stores/auth';
import MaterialCard from '../components/MaterialCard.vue';

const auth = useAuthStore();

const subjects = ['语文', '数学', '英语', '科学', '道德与法治', '音乐', '美术', '体育'];
const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
const types = ['课件', '教案', '习题', '素材', '3D模型'];

const materials = ref<Material[]>([]);
const loading = ref(true);
const uploadDialogVisible = ref(false);
const uploading = ref(false);
const pendingFile = ref<File | null>(null);

const uploadForm = ref({
  title: '',
  subject: '数学',
  grade: '三年级',
  type: '课件',
  description: '',
});

onMounted(loadData);

async function loadData() {
  loading.value = true;
  try {
    const res = await api.get('/user/materials');
    materials.value = res.data.items;
  } finally {
    loading.value = false;
  }
}

function handleUpload(file: File) {
  pendingFile.value = file;
  uploadForm.value.title = file.name.replace(/\.[^.]+$/, '');
  uploadDialogVisible.value = true;
  return false;
}

async function submitUpload() {
  if (!pendingFile.value) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('file', pendingFile.value);
    fd.append('title', uploadForm.value.title);
    fd.append('subject', uploadForm.value.subject);
    fd.append('grade', uploadForm.value.grade);
    fd.append('type', uploadForm.value.type);
    if (uploadForm.value.description) fd.append('description', uploadForm.value.description);

    await api.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    ElMessage.success('上传成功');
    uploadDialogVisible.value = false;
    await loadData();
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '上传失败');
  } finally {
    uploading.value = false;
  }
}

async function handleRemove(m: Material) {
  try {
    if (auth.user && m.uploaderId === auth.user.id) {
      await api.delete(`/materials/${m.id}`);
      ElMessage.success('已删除教材');
    } else {
      await api.delete(`/user/materials/${m.id}`);
      ElMessage.success('已取消收藏');
    }
    await loadData();
  } catch {
    ElMessage.error('删除失败');
  }
}
</script>
