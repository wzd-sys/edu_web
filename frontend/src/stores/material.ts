import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';

export interface Material {
  id: number;
  title: string;
  subject: string;
  grade: string;
  type: string;
  description: string | null;
  fileUrl: string;
  coverUrl: string | null;
  modelUrl: string | null;
  likeCount: number;
  uploaderId: number;
  createdAt: string;
  uploader: { id: number; username: string };
}

export const useMaterialStore = defineStore('material', () => {
  const materials = ref<Material[]>([]);
  const total = ref(0);
  const loading = ref(false);

  async function fetchMaterials(params: Record<string, unknown> = {}) {
    loading.value = true;
    try {
      const res = await api.get('/materials', { params });
      materials.value = res.data.items;
      total.value = res.data.total;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMaterial(id: number): Promise<Material> {
    const res = await api.get(`/materials/${id}`);
    return res.data;
  }

  async function uploadMaterial(formData: FormData): Promise<Material> {
    const res = await api.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async function deleteMaterial(id: number) {
    await api.delete(`/materials/${id}`);
  }

  return { materials, total, loading, fetchMaterials, fetchMaterial, uploadMaterial, deleteMaterial };
});
