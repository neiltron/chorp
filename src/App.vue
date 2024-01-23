<script setup lang="ts">
import { ref } from 'vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AudioReceiver from './components/AudioReceiver.vue'
import AudioSender from './components/AudioSender.vue'
</script>

<template>
  <header class="flex justify-between pb-4">
    <h1 class="font-bold text-lg">chorp</h1>
    <nav>
      transmit data between devices via webaudio.
      <!-- <a href="#">what is this?</a> -->
    </nav>
  </header>
  <main>
    <Tabs default-value="sender" class="max-w-[920px]">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="sender">
          Sender
        </TabsTrigger>
        <TabsTrigger value="receiver">
          Receiver
        </TabsTrigger>
      </TabsList>
      <TabsContent value="receiver">
        <Card class="space-y-2 flex flex-col">
          <CardHeader class="space-y-2 flex flex-col">
            <CardTitle>Receiver</CardTitle>
            <CardDescription>
              Enable the "receive" toggle below and enable the microphone. Then open this page on another device, set it to Sender, and start transmitting.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <AudioReceiver />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="sender">
        <Card class="space-y-2 flex flex-col">
          <CardHeader class="space-y-2 flex flex-col">
            <CardTitle>Sender</CardTitle>
            <CardDescription>
              Open this page on another device, set it to Receiver, and enable the microphone. Then type your message below and click "send".
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <AudioSender />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </main>
</template>

<style scoped>
main, header {
  width: 40rem;
  max-width: 100%;
}

nav a {
  text-decoration: underline;
  text-decoration-color: #cca;
  text-decoration-thickness: 3px;
}
</style>
