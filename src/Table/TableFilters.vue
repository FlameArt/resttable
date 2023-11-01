<template>
  <div class="fc flex-wrap">
    <div v-for="(col) in props.columns" :key="col.name" v-show="col.Filter.isShow" :class="col.Filter.classes">

      <!-- ТЕКСТ -->
      <div class="fc flex-col">
        <div class="text-xs text-slate-400">{{ col.title.toUpperCase() ?? col.name }}</div>
        <div v-if="col.Filter.type === 'text' || col.Filter.type === 'fixed' || col.Filter.type === 'fulltext'">
          <input class="outline-none border border-slate-500 px-2 py-1 mx-2" :placeholder="col.title ?? col.name"
            type="text" @keyup="update()" v-model="col.Filter.valueString" />
        </div>
        <div v-if="col.Filter.type === 'selector'">
          <select class="outline-none border border-slate-500 px-2 py-1 mx-2" :placeholder="col.title ?? col.name"
            @change="update()" v-model="col.Filter.valueString">
            <option v-for="item in col.Selector.values" :key="item[0]" value="">
              {{ item[1] }}
            </option>
          </select>
        </div>
        <div v-if="col.Filter.type === 'date' || col.Filter.type === 'daterange'">
          <Datepicker v-if="col.Filter.type === 'date'" v-model="col.Filter.valueString" :auto-apply="true"
            :enable-time-picker="false" @update:model-value="update()" :teleport="true"></Datepicker>
          <Datepicker v-if="col.Filter.type === 'daterange'" v-model="col.Filter.valueRange" :range="true"
            :enable-time-picker="false" :auto-apply="true" @update:model-value="update()" :teleport="true"
            style="z-index: 99999;"></Datepicker>
        </div>
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
import Datepicker from '@vuepic/vue-datepicker';

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
