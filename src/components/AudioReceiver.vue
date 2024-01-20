<template>
  <div>
    <div class="text-display">
      <button @click="toggleReceiving">
          {{ isReceiving ? 'Receiving' : 'Receive' }}
      </button>
      <span class="text-display-inner">
        {{ fullText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import AudioDataReceiver from '../lib/audiodatareceiver';

const audioDataReceiver = new AudioDataReceiver();
const receivedText = ref('');
const fullText = ref('');
const isReceiving = ref(audioDataReceiver.isReceiving);
const textareaEl = ref(null);

watch(receivedText, async () => {
  await nextTick();
  if (textareaEl.value != null) {
    textareaEl.value.scrollTop = textareaEl.value?.scrollHeight;
  }
});

const toggleReceiving = () => {
    if (isReceiving.value) {
        stopReceiving()
    } else {
        startReceiving();
    }
}

const stopReceiving = () => {
    audioDataReceiver.stopAudioContext();
}

const startReceiving = () => {
  audioDataReceiver.startReceiving(
    (text: string) => {
      receivedText.value = text;
      fullText.value += text;
    },
    (status: boolean) => {
        isReceiving.value = status;
    });
};

onBeforeUnmount(() => {
  try {
    audioDataReceiver.stopReceiving();
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
h2 {
    padding: 0;
}
button {
  display: block;
  padding: 8px 2px;
  border-radius: 6px;
}
textarea {
    width: 30rem;
    min-height: 10rem;
    font-size: 1rem;
    padding: .4rem;
    margin-top: .5rem;
}

.text-display {
  height: 36rem;
  font-size: 2rem;
  font-weight: 800;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  text-align: center;
  padding: 20px;
  max-width: 100%;
  background-color: #222;
  border-radius: 6px;
  min-height: 20rem;
  display: flex;
  flex-direction: column;
  text-transform: uppercase;
  word-break: break-all;
}
</style>
