<template>
  <div>
    <div class="text-display bg-stone-700">
      <div class="flex items-center space-x-2 text-white">
        <Switch
          id="receiving-switch"
          :checked="isReceiving"
          @update:checked="toggleReceiving"
        />
        <Label for="receiving-switch" class="text-white">{{ isReceiving ? 'Receiving' : 'Receive' }}</Label>
      </div>
      <span ref="textareaEl" class="text-display-inner">
        {{ fullText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AudioDataReceiver from '../lib/audiodatareceiver';

const audioDataReceiver = new AudioDataReceiver();
const receivedText = ref('');
const fullText = ref('');
const isReceiving = ref(audioDataReceiver.isReceiving);
const textareaEl = ref<HTMLTextAreaElement | null>(null);

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
  color: #eee;
  display: flex;
  gap: 1rem;
  max-width: 100%;
  height: 5rem;
  min-height: 10rem;
  padding: 20px;
  font-size: 1.4rem;
  line-height: 1;
  font-weight: 500;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  border-radius: 6px;
  flex-direction: column;
  text-transform: uppercase;
  word-break: break-all;
}

.text-display-inner {
  overflow: auto;
  padding-top: 10px;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 20%);
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 20%);
}
</style>
