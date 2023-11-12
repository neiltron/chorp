<template>
        <div>
            <h2>Data sender</h2>
            <textarea v-model="textToSend" placeholder="Enter text to send"></textarea>
            <button @click="startSending">Send</button>
        </div>
</template>
  
<script lang="ts">
import AudioDataSender from "../lib/audiodatasender"; 

export default {
    data() {
        return {
            textToSend: "",
        };
    },
    methods: {
        startSending() {
            const sender = new AudioDataSender();
            sender.startSending(this.textToSend);
        },
    },
};
</script>

<style scoped>
/* Add your component-specific styles here */
textarea {
    width: 30rem;
    min-height: 10rem;
    font-size: 1rem;
    padding: .4rem;
    margin-bottom: 0;
    display: block;
}
button {
    margin-bottom: .5rem;
}
</style>
