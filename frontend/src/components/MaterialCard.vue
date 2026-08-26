<template>
  <el-card shadow="hover" style="cursor: pointer;" @click="$emit('click')">
    <div style="height: 160px; background: #f5f7fa; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 4px; margin-bottom: 8px;">
      <el-image v-if="material.coverUrl" :src="material.coverUrl" fit="cover" style="width: 100%; height: 100%;" />
      <div v-else style="text-align: center; color: #c0c4cc;">
        <div style="font-size: 48px;">{{ typeIcon }}</div>
        <div style="font-size: 12px;">{{ material.type }}</div>
      </div>
    </div>
    <h4 style="margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ material.title }}</h4>
    <div style="display: flex; justify-content: space-between; align-items: center; color: #909399; font-size: 12px;">
      <span>{{ material.subject }} · {{ material.grade }}</span>
      <span>{{ material.likeCount }} 赞</span>
    </div>
    <slot name="actions"></slot>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Material } from '../stores/material';

const props = defineProps<{ material: Material }>();
defineEmits(['click']);

const typeIcon = computed(() => {
  const icons: Record<string, string> = {
    '课件': '📋', '教案': '📝', '习题': '📄', '素材': '🎨', '3D模型': '🧊',
  };
  return icons[props.material.type] || '📁';
});
</script>
