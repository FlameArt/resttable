<template>
  <div class="fc flex-wrap">
    <div v-for="(col) in props.columns" :key="col.name" v-show="col.Filter.isShow"
      :class="col.Filter.classes + (col.Filter.type === 'selector' && col.Filter.selector.mode === 'horizontal' ? ' w-full ' : '')">

      <div class="fc flex-col">
        <div class="text-xs text-slate-400">{{ col.title.toUpperCase() ?? col.name }}</div>

        <!-- ТЕКСТ -->
        <div v-if="col.Filter.type === 'text' || col.Filter.type === 'fixed' || col.Filter.type === 'fulltext'">
          <input class="outline-none border border-slate-500 px-2 py-1 mx-2" :placeholder="col.title ?? col.name"
            type="text" @keyup="update()" v-model="col.Filter.valueString" />
        </div>

        <!-- СЕЛЕКТОРЫ -->
        <div v-if="col.Filter.type === 'selector'">
          <!-- ВЕРТИКАЛЬНЫЕ -->
          <!--<select v-if="col.Filter.selector.mode === 'vertical'" :multiple="col.Filter.selector.multiselect"
            class="outline-none border border-slate-500 px-2 py-1 mx-2" :placeholder="col.title ?? col.name"
            @change="update(col)" v-model="col.Filter.valueString">
            <option v-for="item in col.Selector.values" :key="item.id" :value="item.id">
              {{ item.title }}
            </option>
          </select>-->
          <v-select :multiple="col.Filter.selector.multiselect" v-model="col.Filter.valueString"
            :options="col.Selector.values" class="min-w-[150px]" @option:selected="update(col)"
            @option:deselected="update(col)" />
        </div>
        <div v-if="col.Filter.type === 'selector' && col.Filter.selector.mode === 'horizontal'"
          class="w-full text-center">
          <!-- ГОРИЗОНТАЛЬНЫЕ -->
          <div v-for="item in col.Selector.values" :key="item.id" class="px-2 py-1 mx-1 inline-block rounded-[30px]"
            :style="'background-color:' + (item.color ?? 'rgb(148,163,184)')">
            {{ item.title }}
          </div>
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
import { onMounted, reactive, ref, defineProps } from '@vue/runtime-core'; import { computed, type Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"

// Иконки
import { XCircleIcon } from '@icons/24/solid'
import TableOpts from './TableOpts';
import { Column, IColumn } from './Columns';
//import { TableFilter } from './TableOpts.js';
import FlameTable from './FlameTable';
import Datepicker from '@vuepic/vue-datepicker';
import vSelect from 'vue-select'
import ITableSelectorItem from './TableSelectorItem';

// Глобальное хранилище и роуты
const store = storeFile(), router = useRouter(), route = useRoute();

// Локальное состояние компонента
const state = reactive({
  data: {},
})

// Входящие данные компонента
const props = defineProps<{
  columns: { [key: string]: Column; },
  table: FlameTable<any>,
}>()

// Примонтировано
onMounted(async () => {

})


const update = (col?: Column) => {

  // селектор преобразуем к v-model
  if (col && col.Filter?.selector?.multiselect) {
    col.Filter.valueRange = (col.Filter.valueString as any).map((r: ITableSelectorItem) => r.id);
  }

  props.table.update();

}




</script>

<style scoped lang="scss"></style>
