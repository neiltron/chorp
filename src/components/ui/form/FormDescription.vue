<script lang="ts" setup>
import { useFormField } from './useFormField'
import { cn } from '@/lib/utils'

const { formDescriptionId } = useFormField()
</script>

<template>
  <p
    :id="formDescriptionId"
    :class="cn('text-[0.8rem] text-neutral-500 dark:text-neutral-400', $attrs.class ?? '')"
  >
    <slot />
  </p>
</template>
