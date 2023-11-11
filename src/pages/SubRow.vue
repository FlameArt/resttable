<template lang="pug">
.fb.my-5.text-left(class="mobile:flex-wrap mobile:justify-between mobile:w-full")
  .bg-green(class="w-[300px] h-[300px]")
  .ml-5(class="mobile:w-full")
    .fb.my-1(class="mobile:flex-wrap mobile:w-full mobile:justify-between")
      div.inline-block.text-3xl NAME
      span.text-sm.inline-block.bg-blue-200.mx-5.py-1.px-2 TYPE

      div.text-sm.bg-slate-100.text-slate-500.px-2.py-1.inline-block
        span Flex right block
        span.ml-1 block 2

    div.my-1
      span.text-xl Text: xxxxx

    div.my-1
      .text-sm.inline-block.bg-yellow-100.mr-2.py-1.px-2 TEST
    div.my-1.text-sm  Text: xxxxx
    div.my-1.text-sm  Text: xxxxx
    div.my-1.text-sm  Text: xxxxx
    div.my-1.text-sm  Text: xxxxx
    

</template>

<script setup lang="ts">
import { onMounted, reactive, ref, defineProps, defineEmits, nextTick } from '@vue/runtime-core'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"

// Иконки
import { } from '@icons/24/solid'

// Глобальное хранилище и роуты
const store = storeFile(), router = useRouter(), route = useRoute();

// Входящие данные компонента
const emit = defineEmits(['test'])

// Локальное состояние компонента
const state = reactive({
  data: {},
  calendar: '',
  disabledDates: [] as any[],
  links: [] as any[],
  updatedDT: null as any,
})


</script>

<style scoped lang="scss"></style>
