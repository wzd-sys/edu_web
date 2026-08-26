<template>
  <div style="padding: 20px;">
    <el-row :gutter="16" align="middle" style="margin-bottom: 16px;">
      <el-col :span="4">
        <el-select v-model="filters.subject" placeholder="学科" clearable @change="loadData">
          <el-option v-for="s in subjects" :key="s" :label="s" :value="s" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="filters.grade" placeholder="年级" clearable @change="loadData">
          <el-option v-for="g in grades" :key="g" :label="g" :value="g" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="filters.type" placeholder="类型" clearable @change="loadData">
          <el-option v-for="t in types" :key="t" :label="t" :value="t" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-input v-model="filters.keyword" placeholder="搜索关键词" clearable @keyup.enter="loadData" />
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="loadData">搜索</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="16" v-loading="materialStore.loading">
      <el-col :span="6" v-for="m in materialStore.materials" :key="m.id" style="margin-bottom: 16px;">
        <MaterialCard :material="m" @click="$router.push(`/materials/${m.id}`)" />
      </el-col>
    </el-row>

    <el-empty v-if="!materialStore.loading && materialStore.materials.length === 0" description="暂无教材" />

    <el-row justify="center" style="margin-top: 16px;">
      <el-pagination
        v-model:current-page="page"
        :page-size="12"
        :total="materialStore.total"
        layout="prev, pager, next"
        @current-change="loadData"
      />
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMaterialStore } from '../stores/material';
import MaterialCard from '../components/MaterialCard.vue';

const route = useRoute();
const materialStore = useMaterialStore();
const page = ref(1);

const subjects = ['语文', '数学', '英语', '科学', '道德与法治', '音乐', '美术', '体育'];
const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
const types = ['课件', '教案', '习题', '素材', '3D模型'];

const filters = ref({
  subject: (route.query.subject as string) || '',
  grade: '',
  type: '',
  keyword: (route.query.keyword as string) || '',
});

watch(() => route.query, () => {
  filters.value.subject = (route.query.subject as string) || '';
  filters.value.keyword = (route.query.keyword as string) || '';
  page.value = 1;
  loadData();
});

async function loadData() {
  const params: Record<string, unknown> = { page: page.value, pageSize: 12 };
  if (filters.value.subject) params.subject = filters.value.subject;
  if (filters.value.grade) params.grade = filters.value.grade;
  if (filters.value.type) params.type = filters.value.type;
  if (filters.value.keyword) params.keyword = filters.value.keyword;
  await materialStore.fetchMaterials(params);
}

onMounted(loadData);
</script>
