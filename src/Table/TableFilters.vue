<template>
  <div class="fc flex-wrap">
    <div v-for="(col) in props.columns" :key="col.name">
      {{ col.name }}
      <!-- ТЕКСТ -->
      <div v-if="col.Filter.type === 'text'">
        <input type="text" @keyup="update()" v-model="col.Filter.valueString" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { onMounted, reactive, ref, defineProps } from '@vue/runtime-core'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"

// Иконки
import { XCircleIcon } from '@icons/24/solid'
import TableOpts from './TableOpts';
import { Column } from './Columns';
//import { TableFilter } from './TableOpts.js';
import FlameTable from './FlameTable';

// Глобальное хранилище и роуты
const store = storeFile(), router = useRouter(), route = useRoute();

// Локальное состояние компонента
const state = reactive({
  data: {}
})

// Входящие данные компонента
const props = defineProps<{
  columns: { [key: string]: Column; },
  table: FlameTable<any>,
}>()

// Примонтировано
onMounted(async () => {

})


const update = () => {

  props.table.update();

}

</script>

<style scoped lang="scss"></style>
