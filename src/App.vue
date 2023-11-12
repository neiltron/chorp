<script setup lang="ts">
import AudioReceiver from './components/AudioReceiver.vue'
import AudioSender from './components/AudioSender.vue'
</script>

<template>
  <main>
    <AudioSender />
    <hr />
    <AudioReceiver />
  </main>
</template>

<style scoped>
hr {
  margin: 2rem 0;
}

main {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>
