<template>
  <div style="padding: 20px; max-width: 1000px; margin: 0 auto;" v-loading="loading">
    <template v-if="material">
      <el-page-header @back="$router.back()" :title="material.title" style="margin-bottom: 20px;" />

      <el-row :gutter="24">
        <el-col :span="16">
          <el-card>
            <div v-if="material.modelUrl" style="height: 500px;">
              <ModelViewer :model-url="material.modelUrl" />
            </div>
            <div v-else-if="material.coverUrl" style="text-align: center;">
              <el-image :src="material.coverUrl" fit="contain" style="max-height: 500px;" />
            </div>
            <div v-else style="text-align: center; padding: 60px; color: #909399;">
              <el-icon size="64"><Document /></el-icon>
              <p>文件预览暂不支持此格式</p>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card>
            <h3>{{ material.title }}</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="学科">{{ material.subject }}</el-descriptions-item>
              <el-descriptions-item label="年级">{{ material.grade }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ material.type }}</el-descriptions-item>
              <el-descriptions-item label="上传者">{{ material.uploader.username }}</el-descriptions-item>
              <el-descriptions-item label="点赞">{{ material.likeCount }}</el-descriptions-item>
              <el-descriptions-item label="上传时间">{{ new Date(material.createdAt).toLocaleDateString() }}</el-descriptions-item>
            </el-descriptions>

            <p v-if="material.description" style="color: #606266; margin-top: 12px;">{{ material.description }}</p>

            <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
              <el-button :type="liked ? 'danger' : 'default'" @click="handleLike">
                {{ liked ? '取消点赞' : '点赞' }} ({{ likeCount }})
              </el-button>
              <el-button :type="collected ? 'warning' : 'default'" @click="handleCollect">
                {{ collected ? '取消收藏' : '收藏' }}
              </el-button>
              <el-button type="success" @click="handleDownload">下载</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import { useMaterialStore, type Material } from '../stores/material';
import ModelViewer from '../components/ModelViewer.vue';
import api from '../api';

const route = useRoute();
const materialStore = useMaterialStore();

const material = ref<Material | null>(null);
const loading = ref(true);
const liked = ref(false);
const likeCount = ref(0);
const collected = ref(false);

onMounted(async () => {
  const id = Number(route.params.id);
  try {
    material.value = await materialStore.fetchMaterial(id);
    likeCount.value = material.value.likeCount;

    try {
      const statusRes = await api.get(`/likes/${id}/status`);
      liked.value = statusRes.data.liked;
      likeCount.value = statusRes.data.likeCount;
    } catch { /* not logged in */ }
  } finally {
    loading.value = false;
  }
});

async function handleLike() {
  if (!material.value) return;
  try {
    const res = await api.post(`/likes/${material.value.id}`);
    liked.value = res.data.liked;
    likeCount.value = res.data.likeCount;
  } catch {
    ElMessage.warning('请先登录');
  }
}

async function handleCollect() {
  if (!material.value) return;
  try {
    if (collected.value) {
      await api.delete(`/user/materials/${material.value.id}`);
      collected.value = false;
      ElMessage.success('已取消收藏');
    } else {
      await api.post(`/user/materials/${material.value.id}`);
      collected.value = true;
      ElMessage.success('已收藏到个人空间');
    }
  } catch {
    ElMessage.warning('请先登录');
  }
}

function handleDownload() {
  if (!material.value) return;
  window.open(`/api/materials/${material.value.id}/download`, '_blank');
}
</script>
