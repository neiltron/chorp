<template>
  <div>
    <h2>Data Receiver</h2>
    <button @click="toggleReceiving">
        {{ isReceiving ? 'Receiving' : 'Receive' }}
    </button>
    <textarea v-model="receivedText" readonly placeholder="Received data will appear here"></textarea>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import AudioDataReceiver from '../lib/audiodatareceiver';

const audioDataReceiver = new AudioDataReceiver();
const receivedText = ref('');
const isReceiving = ref(audioDataReceiver.isReceiving);

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
    },
    (status: boolean) => {
        isReceiving.value = status;
    });
};

onBeforeUnmount(() => {
  audioDataReceiver.stopReceiving();
});
</script>

<style scoped>
h2 {
    padding: 0;
}
button { display: block; }
textarea {
    width: 30rem;
    min-height: 10rem;
    font-size: 1rem;
    padding: .4rem;
    margin-top: .5rem;
}
</style>
