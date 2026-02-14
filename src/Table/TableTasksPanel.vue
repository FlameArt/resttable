<template>
  <!-- "ДОБАВИТЬ" И ЧИСЛО ЗАПИСЕЙ-->
  <div class="flex flex-wrap items-center justify-between">

    <!-- ЛЕВАЯ ЧАСТЬ -->
    <div>
      <!-- Стандартные кнопки -->
      <slot name="defaultButtons">
        <div v-show="state.opts?.Add.can"
          class="flex mr-3 cursor-pointer justify-center items-center text-white bg-blue-600 font-medium rounded text-sm px-4 text-center hover:bg-blue-700 .focus:ring-4.focus:ring-blue-200.dark:focus:ring-blue-900"
          @click="emit('add')">
          <div class="text-xl">
            +
          </div>
          <div class="ml-2">
            {{ state.opts?.Add.buttonTitle }}
          </div>
        </div>
        <div v-show="state.opts?.Export.CSV.can"
          class="flex mr-3 cursor-pointer justify-center items-center text-white bg-blue-600 font-medium rounded text-sm px-4 text-center hover:bg-blue-700 .focus:ring-4.focus:ring-blue-200.dark:focus:ring-blue-900"
          @click="state.Table.exportToCSV()">
          <div class="text-xl">
            +
          </div>
          <div class="ml-2">
            {{ state.opts?.Export.CSV.buttonTitle }}
          </div>
        </div>
      </slot>

      <!-- Доп кнопки -->
      <slot name="otherButtons" />


      <!-- ЧИСЛО ЗАПИСЕЙ -->
      <div class="text-xs text-gray-400 ml-2">
        {{ state.opts.lang === 'ru' ? 'Показано:' : 'Showing' }} {{ state.Table.Pager.total > state.Table.Pager.perPage *
          state.Table.Pager.page ?
          state.Table.Pager.perPage * state.Table.Pager.page : state.Table.Pager.total }} / {{ state.Table.Pager.total }} {{
    state.opts.lang === 'ru' ?
    'записей' : ' records' }}
      </div>

    </div>

    <!-- ПРАВАЯ ЧАСТЬ -->
    <div>

      <!-- ДЕЙСТВИЯ С ОТМЕЧЕННЫМИ -->
      <div class="fc" v-show="state.opts.Export.isShow">
        <div>
          <div class="inline-block">
            <span v-if="state.Table.exportStatus === 'exportprocess'" class="text-green-600 bg-green-50 px-2 py-1 mx-2">
              {{ props.table.opts.lang === 'ru' ? 'Загрузка...' : 'Loading...' }}
            </span>
          </div>
          <label>
            <select class="minimal text-xs text-center text-slate-500" v-model="state.selectModel" @change="selectAction">
              <option :value="0">{{ state.opts.lang === 'ru' ? 'ДЕЙСТВИЯ' : 'ACTIONS' }}</option>
              <option :value="1">{{ state.opts.lang === 'ru' ? 'Выгрузить выбранные' : 'Export selected' }} [{{
                state.Table.getSelectedRows().length }}]
              </option>
              <option :value="2">{{ state.opts.lang === 'ru' ? 'Выгрузить всё' : 'Export all' }} [{{
                state.Table.Pager.total }}]</option>
            </select>
          </label>
        </div>
        <!--
        <div
          class="flex mr-3 cursor-pointer justify-center items-center text-white bg-blue-600 font-medium rounded text-sm px-4 text-center hover:bg-blue-700 .focus:ring-4.focus:ring-blue-200.dark:focus:ring-blue-900">
          <div class="text-xl">
            +
          </div>
          <div class="ml-2">
            Экспорт отмеченных {{ 5 }}
          </div>
        </div>
        <div
          class="flex mr-3 cursor-pointer justify-center items-center text-white bg-blue-600 font-medium rounded text-sm px-4 text-center hover:bg-blue-700 .focus:ring-4.focus:ring-blue-200.dark:focus:ring-blue-900">
          <div class="text-xl">
            +
          </div>
          <div class="ml-2">
            Экспорт всех {{ state.Table.Pager.total }}
          </div>
        </div>
        -->
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, nextTick } from 'vue'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"

// Иконки
import { } from '@icons/24/solid'
import FlameTable from './FlameTable';

// Глобальное хранилище и роуты
const store = storeFile(), router = useRouter(), route = useRoute();

// Входящие данные компонента
const props = defineProps<{
  table: FlameTable<any>,
}>()
const emit = defineEmits(['add'])

// Локальное состояние компонента
const state = reactive({
  opts: props.table.opts,
  Table: props.table,
  selectModel: 0,
})

const selectAction = () => {

  switch (state.selectModel) {
    case 0:
      break;
    case 1:
      state.Table.exportToXLS(true);
      break;
    case 2:
      state.Table.exportToXLS(false);
      break;
  }

  state.selectModel = 0;

}

</script>

<style scoped lang="scss">
$height: 36;

label {
  position: relative;
  display: inline-block;

  &:before {
    content: '';
    height: ($height - 5) + px;
    position: absolute;
    right: 7px;
    top: 3px;
    width: 22px;

    //background: -webkit-linear-gradient(#fff, #f0f0f0);
    //background: -moz-linear-gradient(#fff, #f0f0f0);
    //background: linear-gradient(#f5f5f5, #e0e0e0);
    background: #fff; //for Firefox in Android

    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    pointer-events: none;
    display: block;
  }

  &:after {
    content: " ";
    position: absolute;
    right: 15px;
    top: 46%;
    margin-top: -3px;
    z-index: 2;
    pointer-events: none;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6.9px 4px 0 4px;
    border-color: #aaa transparent transparent transparent;
    pointer-events: none;
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding: 0 30px 0 10px;

    border: 1px solid #e0e0e0;
    border-radius: 3px;
    line-height: $height + px;
    height: $height + px;
    //box-shadow: inset 1px 1px 1px 0px rgba(0, 0, 0, 0.2);
    background: #fff;

    //min-width: 200px;
    margin: 0 5px 5px 0;
  }
}

//fix for ie 10 later
select::-ms-expand {
  display: none;
}
</style>
