<template>
  <div class="fc flex-wrap">
    <div v-for="(col) in props.columns" :key="col.name" v-show="col.Filter.isShow"
      :class="(col.Filter.classes + (col.Filter.type === 'selector' && col.Filter.selector.mode === 'horizontal' ? ' w-full ' : ''))"
      class="py-1 mobile:w-full mobile:px-2 mobile:block desktop:inline-block desktop:mx-2">

      <div class="fc flex-col ">
        <div :class="col.Filter.titleClasses" class="text-xs text-slate-400">{{ col.Filter.title ??
          col.title.toUpperCase() ?? col.name }}</div>

        <!-- ТЕКСТ -->
        <div class="mobile:w-full"
          v-if="col.Filter.type === 'text' || col.Filter.type === 'fixed' || col.Filter.type === 'fulltext'">
          <input class="mobile:w-full outline-none border border-slate-500 px-2 py-1"
            :placeholder="col.title ?? col.name" type="text" @keyup="update()" v-model="col.Filter.valueString" />
        </div>

        <!-- ЦИФРЫ -->
        <div class="fc mobile:w-full px-2" v-if="col.Filter.type === 'number'">
          <input class="max-w-[100px] flex-1 outline-none border border-slate-500 px-2 py-1"
            :placeholder="'From ' + (col.title ?? col.name)" type="text" @keyup="update()"
            v-model="col.Filter.valueRangeNumbers.from" />
          <span class="mx-2"> - </span>
          <input class="max-w-[100px] flex-1 outline-none border border-slate-500 px-2 py-1"
            :placeholder="'To ' + (col.title ?? col.name)" type="text" @keyup="update()"
            v-model="col.Filter.valueRangeNumbers.to" />
        </div>

        <!-- СЕЛЕКТОРЫ -->

        <!-- ВЕРТИКАЛЬНЫЕ -->
        <div v-if="col.Filter.type === 'selector'" class="mobile:w-full">
          <v-select :multiple="col.Filter.selector.multiselect" v-model="col.Filter.valueString"
            :options="col.Selector.values" class="mobile:w-full min-w-[150px]" @option:selected="update(col)"
            @option:deselected="update(col)" />
        </div>

        <!-- ГОРИЗОНТАЛЬНЫЕ -->
        <div v-if="col.Filter.type === 'selector' && col.Filter.selector.mode === 'horizontal'"
          class="w-full text-center">
          <div v-for="item in col.Selector.values" :key="item.id" class="px-2 py-1 mx-1 inline-block rounded-[30px]"
            :style="'background-color:' + (item.color ?? 'rgb(148,163,184)')">
            {{ item.title }}
          </div>
        </div>

        <!-- ДАТА -->
        <div class="mobile:w-full" v-if="col.Filter.type === 'date' || col.Filter.type === 'daterange'">
          <Datepicker class="mobile:w-full" v-if="col.Filter.type === 'date'" v-model="col.Filter.valueString"
            :auto-apply="true" :enable-time-picker="false" @update:model-value="update()" :teleport="true"></Datepicker>
          <Datepicker class="mobile:w-full" v-if="col.Filter.type === 'daterange'" v-model="col.Filter.valueRange"
            :range="true" :enable-time-picker="false" :auto-apply="true" @update:model-value="update()"
            :teleport="true">
          </Datepicker>
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

  props.table.update({}, null, 'filters');

}




</script>

<style scoped lang="scss"></style>
