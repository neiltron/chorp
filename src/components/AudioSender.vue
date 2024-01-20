<template>
    <div>
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
div {
    display: flex;
    flex-direction: column;
}
textarea {
    flex: 1;
    width: 100%;
    min-height: 10rem;
    font-size: 1rem;
    padding: 1rem;
    margin-bottom: 0;
    display: block;
    border-radius: 6px;
    background-color: #333;
    color: #fff;
    border: none;
    font-size: 2rem;
}
button {
    margin-top: 8px;
    padding: 8px 2px;
    border-radius: 2px;
}
</style>
