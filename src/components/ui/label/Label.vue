<script setup lang="ts">
import { Label, type LabelProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<LabelProps & { class?: string }>()
</script>

<template>
  <Label
    v-bind="props"
    :class="
      cn(
        'block text-sm tracking-tight font-medium text-neutral-950 text-left dark:text-neutral-50',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>
