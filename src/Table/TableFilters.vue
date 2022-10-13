<template lang="pug">
.flex
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, defineProps } from '@vue/runtime-core'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"

// Иконки
import { XCircleIcon } from '@icons/solid'
import { TableFilter } from './TableOpts.js';

// Глобальное хранилище и роуты
const store = storeFile(), router = useRouter(), route = useRoute();

// Локальное состояние компонента
const state = reactive({
  data: {}
})

// Входящие данные компонента
const props = defineProps<{
  filters: Array<TableFilter>
}>()

// Примонтировано
onMounted(async () => {

})

</script>

<style scoped lang="scss">
</style>
