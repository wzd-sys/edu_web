<template>
  <div>
    <el-row justify="center" style="margin-top: 40px;">
      <el-col :span="16">
        <div style="text-align: center;">
          <h1 style="color: #303133; font-size: 32px;">小学教师教材管理平台</h1>
          <p style="color: #909399; font-size: 16px;">一站式教材管理，支持3D可视化浏览、AI辅助教学问答</p>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索教材..."
            size="large"
            style="max-width: 500px; margin: 24px auto; display: block;"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 40px; padding: 0 40px;">
      <el-col :span="6" v-for="cat in categories" :key="cat.name">
        <el-card shadow="hover" style="cursor: pointer; text-align: center;" @click="goCategory(cat.name)">
          <div style="font-size: 36px;">{{ cat.icon }}</div>
          <h3>{{ cat.name }}</h3>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 40px; padding: 0 40px;">
      <el-col :span="24">
        <h2 style="color: #303133;">热门教材</h2>
        <el-row :gutter="16">
          <el-col :span="6" v-for="m in hotMaterials" :key="m.id">
            <MaterialCard :material="m" @click="$router.push(`/materials/${m.id}`)" />
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMaterialStore, type Material } from '../stores/material';
import MaterialCard from '../components/MaterialCard.vue';

const router = useRouter();
const materialStore = useMaterialStore();

const searchKeyword = ref('');
const hotMaterials = ref<Material[]>([]);

const categories = [
  { name: '语文', icon: '📖' },
  { name: '数学', icon: '🔢' },
  { name: '英语', icon: '🔤' },
  { name: '科学', icon: '🔬' },
];

onMounted(async () => {
  await materialStore.fetchMaterials({ page: 1, pageSize: 4 });
  hotMaterials.value = [...materialStore.materials].sort((a, b) => b.likeCount - a.likeCount);
});

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/materials', query: { keyword: searchKeyword.value } });
  }
}

function goCategory(subject: string) {
  router.push({ path: '/materials', query: { subject } });
}
</script>
