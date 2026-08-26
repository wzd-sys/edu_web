<template>
  <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
    <el-row justify="space-between" align="middle" style="margin-bottom: 16px;">
      <h2 style="margin: 0;">AI 教学助手</h2>
      <el-button size="small" @click="ai.clearMessages()">清空对话</el-button>
    </el-row>

    <el-card style="height: 500px; overflow-y: auto; margin-bottom: 16px;" ref="chatBox">
      <div v-if="ai.messages.length === 0" style="text-align: center; color: #909399; padding-top: 200px;">
        输入问题开始与 AI 助手对话
      </div>
      <div v-for="(msg, i) in ai.messages" :key="i" :style="{ marginBottom: '12px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }">
        <div :style="{ maxWidth: '70%', padding: '10px 14px', borderRadius: '10px', backgroundColor: msg.role === 'user' ? '#409EFF' : '#f4f4f5', color: msg.role === 'user' ? 'white' : '#303133' }">
          <div style="font-size: 12px; color: #909399; margin-bottom: 4px;">{{ msg.role === 'user' ? '我' : 'AI助手' }}</div>
          <div style="white-space: pre-wrap;">{{ msg.content || '...' }}</div>
        </div>
      </div>
    </el-card>

    <el-input
      v-model="inputMessage"
      placeholder="输入你的问题..."
      @keyup.enter="handleSend"
      :disabled="ai.loading"
    >
      <template #append>
        <el-button type="primary" :loading="ai.loading" @click="handleSend">发送</el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useAiStore } from '../stores/ai';

const ai = useAiStore();
const inputMessage = ref('');

watch(() => ai.messages.length, async () => {
  await nextTick();
  const chatBox = document.querySelector('.el-card__body');
  if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
});

async function handleSend() {
  const msg = inputMessage.value.trim();
  if (!msg || ai.loading) return;
  inputMessage.value = '';
  await ai.sendMessage(msg);
}
</script>
