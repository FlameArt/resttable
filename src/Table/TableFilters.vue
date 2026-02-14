<template>
  <div>
    <v-row no-gutters align="stretch">
      <v-col v-for="(col) in sortedFilters" :key="col.name" v-show="col.Filter.isShow"
        :class="(col.Filter.classes + (col.Filter.type === 'selector' && col.Filter.selector.mode === 'horizontal' ? ' w-full ' : ''))"
        class="pa-1" cols="12" md="auto" :style="getTextFilterStyle(col)">

        <div class="fc flex-col h-100">
          <div :class="col.Filter.titleClasses" class="text-xs text-slate-400 mb-1">{{ col.Filter.title ??
            col.title.toUpperCase() ?? col.name }}</div>
          <v-spacer v-if="mdAndUp"></v-spacer>

          <!-- ТЕКСТ -->
          <div class="w-full"
            v-if="col.Filter.type === 'text' || col.Filter.type === 'fixed' || col.Filter.type === 'fulltext'">
            <v-text-field density="compact" :label="col.title ?? col.name" type="text"
              @update:model-value="update()" v-model="col.Filter.valueString" hide-details variant="filled" />
          </div>

          <!-- ЦИФРЫ -->
          <v-row dense v-if="col.Filter.type === 'number'">
            <v-col :style="getNumberFilterStyle(col)">
              <v-text-field class="w-full" density="compact" :label="'От ' + (col.title ?? col.name)" type="number"
                @update:model-value="update()" v-model="col.Filter.valueRangeNumbers.from" hide-details variant="filled" />
            </v-col>
            <v-col :style="getNumberFilterStyle(col)">
              <v-text-field class="w-full" density="compact" :label="'До ' + (col.title ?? col.name)" type="number"
                @update:model-value="update()" v-model="col.Filter.valueRangeNumbers.to" hide-details variant="filled" />
            </v-col>
          </v-row>


          <!-- СЕЛЕКТОРЫ -->
          <div v-if="col.Filter.type === 'selector' && col.Filter.selector.mode !== 'horizontal'" class="w-full">
            <!-- Multi-select -->
            <v-select v-if="col.Filter.selector.multiselect" v-model="col.Filter.valueRange"
              :label="col.title ?? col.name" :items="col.Selector.values" item-title="title" item-value="id"
              class="mobile:w-full min-w-[200px]" density="compact" @update:model-value="update()" hide-details multiple
              chips closable-chips variant="filled">
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend v-if="item.raw.prepend">
                    <span :class="item.raw.prependClasses">{{ item.raw.prepend }}</span>
                  </template>
                  <template #append v-if="item.raw.append">
                    <span :class="item.raw.appendClasses">{{ item.raw.append }}</span>
                  </template>
                </v-list-item>
              </template>
              <template #chip="{ props, item }">
                <v-chip v-bind="props">
                  <span v-if="item.raw.prepend" :class="item.raw.prependClasses" class="mr-1">{{ item.raw.prepend
                  }}</span>
                  <span>{{ item.raw.title }}</span>
                  <span v-if="item.raw.append" :class="item.raw.appendClasses" class="ml-1">{{ item.raw.append }}</span>
                </v-chip>
              </template>
            </v-select>
            <!-- Single-select -->
            <v-select v-else v-model="col.Filter.valueString" :label="col.title ?? col.name"
              :items="col.Selector.values" item-title="title" item-value="id" class="mobile:w-full min-w-[200px]"
              density="compact" @update:model-value="update()" hide-details variant="filled">
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend v-if="item.raw.prepend">
                    <span :class="item.raw.prependClasses">{{ item.raw.prepend }}</span>
                  </template>
                  <template #append v-if="item.raw.append">
                    <span :class="item.raw.appendClasses">{{ item.raw.append }}</span>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <div class="d-flex align-center w-100">
                  <span v-if="item.raw.prepend" :class="item.raw.prependClasses" class="mr-1">{{ item.raw.prepend
                  }}</span>
                  <span class="font-normal">{{ item.raw.title }}</span>
                  <v-spacer></v-spacer>
                  <span v-if="item.raw.append" :class="item.raw.appendClasses">{{ item.raw.append }}</span>
                </div>
              </template>
            </v-select>
          </div>

          <!-- ГОРИЗОНТАЛЬНЫЕ -->
          <div v-if="col.Filter.type === 'selector' && col.Filter.selector.mode === 'horizontal'"
            class="w-full text-center">
            <div v-for="item in col.Selector.values" :key="item.id?.toString()" class="px-2 py-1 mx-1 inline-block rounded-[30px]"
              :style="'background-color:' + (item.color ?? 'rgb(148,163,184)')">
              {{ item.title }}
            </div>
          </div>

          <!-- ДАТА -->
          <div class="w-full" v-if="col.Filter.type === 'date' || col.Filter.type === 'daterange'">
            <Datepicker class="mobile:w-full" v-if="col.Filter.type === 'date'" v-model="col.Filter.valueString"
              :auto-apply="true" :enable-time-picker="false" @update:model-value="update()" :teleport="true"></Datepicker>
            <Datepicker class="mobile:w-full" v-if="col.Filter.type === 'daterange'" v-model="col.Filter.valueRange"
              :range="true" :enable-time-picker="false" :auto-apply="true" @update:model-value="update()"
              :teleport="true">
            </Datepicker>
          </div>
        </div>

      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts" generic="T">
import { onMounted, reactive, ref } from 'vue'; import { computed, type Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"

// Иконки
import { XCircleIcon } from '@icons/24/solid'
import TableOpts from './TableOpts';
import { Column, IColumn } from './Columns';
//import { TableFilter } from './TableOpts.js';
import FlameTable from './FlameTable';
import Datepicker from '@vuepic/vue-datepicker';
// import vSelect from 'vue-select' // Больше не используется
import ITableSelectorItem from './TableSelectorItem';
import { useDisplay } from 'vuetify';
import debounce from 'lodash-es/debounce';

// Глобальное хранилище и роуты
const store = storeFile(), router = useRouter(), route = useRoute();
const { mdAndUp } = useDisplay();

// Локальное состояние компонента
const state = reactive({
  data: {},
})

// Входящие данные компонента
const props = defineProps<{
  columns: { [key: string]: Column; },
  table: FlameTable<any>,
}>()

const sortedFilters = computed(() => {
  return Object.values(props.columns).sort((a, b) => (a.Filter.position ?? 999) - (b.Filter.position ?? 999));
});

// Примонтировано
onMounted(async () => {

})

const getTextFilterStyle = (col: Column) => {
  if (!mdAndUp.value || col.Filter.type === 'number') return '';

  let width = col.Filter.width;
  if (width === null || typeof width === 'undefined') {
    if (['text', 'fixed', 'fulltext'].includes(col.Filter.type)) {
      width = 250;
    }
  }

  if (width) {
    return `min-width: ${width}px; max-width: ${width}px;`;
  }
  return '';
}

const getNumberFilterStyle = (col: Column) => {
  if (!mdAndUp.value) return '';
  let width = col.Filter.width;
  if (width === null || typeof width === 'undefined') {
    width = 85;
  }
  return `min-width: ${width}px; max-width: ${width}px;`;
}


const update = debounce(() => {

  // селектор преобразуем к v-model
  /*
  // Эта логика больше не нужна, т.к. v-select от Vuetify с item-value="id" 
  // сразу пишет в модель нужные значения (id или массив id)
  if (col && col.Filter?.selector?.multiselect) {
    col.Filter.valueRange = (col.Filter.valueString as any).map((r: ITableSelectorItem) => r.id);
  }
  */

  props.table.update({}, null, 'filters');

}, 300);




</script>

<style scoped lang="scss"></style>
