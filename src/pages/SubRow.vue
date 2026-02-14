<template>
  <div class="fb my-5 text-left mobile:flex-wrap mobile:justify-between mobile:w-full">
    <div class="bg-green w-[300px] h-[300px]"></div>
    <div class="ml-5 mobile:w-full">
      <div class="fb my-1 mobile:flex-wrap mobile:w-full mobile:justify-between">
        <div class="inline-block text-3xl">NAME</div>
        <span class="text-sm inline-block bg-blue-200 mx-5 py-1 px-2">TYPE</span>

        <div class="text-sm bg-slate-100 text-slate-500 px-2 py-1 inline-block">
          <span>Flex right block</span>
          <span class="ml-1">block 2</span>
        </div>
      </div>

      <div class="my-1">
        <span class="text-xl">Text: xxxxx</span>
      </div>

      <div class="my-1">
        <div class="text-sm inline-block bg-yellow-100 mr-2 py-1 px-2">TEST</div>
      </div>
      <div class="my-1 text-sm">Text: xxxxx</div>
      <div class="my-1 text-sm">Text: xxxxx</div>
      <div class="my-1 text-sm">Text: xxxxx</div>
      <div class="my-1 text-sm">Text: xxxxx</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, nextTick } from 'vue'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"

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
