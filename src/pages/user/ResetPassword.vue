<template lang="pug">
.flex.justify-center.h-screen.items-center.flex-col
  .px-8.py-6.mt-4.text-left.bg-white.shadow-lg.desktop:w-[725px]
    | Not implemented
</template>

<script setup lang="ts">

import { onMounted, reactive, defineProps } from '@vue/runtime-core'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"
const store = storeFile(); const router = useRouter(), route = useRoute();

// Состояние компонента
const state = reactive({
  test: 5
})

onMounted(() => {

})

</script>

<style scoped lang="scss">

</style>
