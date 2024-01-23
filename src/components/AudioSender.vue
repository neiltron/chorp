<template>
    <div>
        <textarea
            class="bg-stone-700 text-stone-100"
            v-model="textToSend"
            placeholder="Enter text to send"
        ></textarea>
        <Button @click="startSending" class="bg-stone-900 text-stone-100">Send</Button>
    </div>
</template>

<script lang="ts">
import { Button } from '@/components/ui/button'
import AudioDataSender from "../lib/audiodatasender";

export default {
    data() {
        return {
            textToSend: "",
        };
    },
    methods: {
        startSending() {
            console.log(this.textToSend)
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
    border: none;
}
button {
    margin-top: 8px;
    padding: 8px 2px;
    border-radius: 6px;
}
</style>
