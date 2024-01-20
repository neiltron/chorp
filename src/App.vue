<script setup lang="ts">
import { ref } from 'vue';
import AudioReceiver from './components/AudioReceiver.vue'
import AudioSender from './components/AudioSender.vue'

const activeTab = ref('sender');

function handleTabBtn(tab: string) {
  activeTab.value = tab;

  console.log(activeTab.value, tab)
}
</script>

<template>
  <main>
    <div class="tab-container">
      <div class="tab-header">
        <span
          class="tab-button"
          :class="{ active: activeTab === 'sender' }"
          v-on:click="handleTabBtn('sender')"
        >
          Sender
        </span>
        <span
          class="tab-button"
          :class="{ active: activeTab === 'receiver' }"
          v-on:click="handleTabBtn('receiver')"
        >
          Receiver
        </span>
      </div>

      <div class="tab-inner">
        <AudioSender v-if="activeTab === 'sender'" />
        <AudioReceiver v-if="activeTab === 'receiver'" />
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 40rem;
}

.tab-container {
  width: 100%;
  max-width: 40rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
}

.tab-header {
  background-color: #333;
  border-radius: 6px;
  padding: 4px;
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.tab-button {
  flex: 1;
  gap: 10%;
  letter-spacing: -.1px;
  background-color: #444;
  border-radius: 6px;
  padding: 8px 2px;
  text-align: center;
  color: #ddd;
  border-top: 1px solid #555;
  border-bottom: 1px solid #2a2a2a;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif

}
.tab-button.active {
  background-color: #555;
}
</style>
