<template lang="pug">
.mt-0

  // "ДОБАВИТЬ" И ЧИСЛО ЗАПИСЕЙ
  .flex.items-center.justify-between
    slot(name="defaultButtons")
      .flex.cursor-pointer.justify-center.items-center.text-white.block.bg-blue-600.font-medium.rounded.text-sm.px-4.text-center(v-show="$props.opts?.Add.can" @click="add()" class="hover:bg-blue-700 .focus:ring-4.focus:ring-blue-200.dark:focus:ring-blue-900")
        div.text-xl +
        div.ml-2 {{ $props.opts?.Add.buttonTitle }}
    slot(name="otherButtons")
    .text-xs.text-gray-400 Показано: {{ Table.Pager.total > Table.Pager.perPage * Table.Pager.page ? Table.Pager.perPage * Table.Pager.page : Table.Pager.total }} / {{ Table.Pager.total }} записей

  // ТАБЛИЦА
  .mt-2.table.w-full

    // ЗАГОЛОВКИ СТОЛБЦОВ
    .table-header-group
      .table-cell.border-r.border-r-slate-100.px-2(v-for="column in Table.columns"  v-show="column.Table.isShow")
        span {{ column.title !== '' ? column.title : column.name }}
      .table-cell.border-r.border-r-slate-100.px-2(v-if="opts.Edit.can")
        button.bg-green-600.invisible Изменить
      .table-cell.border-r.border-r-slate-100.px-2(v-if="opts.Remove.can")
        button.bg-green-600.invisible Удалить

    // СТРОКИ
    .table-row-group
      .table-row.cursor-pointer(v-for="row in (Table.Rows.rows)" class="hover:bg-slate-100")
        .table-cell.border-r.border-r-slate-100.px-2(v-for="column in Table.columns" v-show="column.Table.isShow" @click="column.Table.click(row, column)" class="last:border-r-0 last:pr-0")
          span {{ column.Table.value(row, column) }}
        .table-cell.border-r.border-r-slate-100.px-2.text-center(v-if="opts.Edit.can")
          button.px-2.py-1.bg-green-600.text-white.my-1(@click="edit(row)") Изменить
        .table-cell.border-r.border-r-slate-100.px-2.text-center(v-if="opts.Remove.can")
          button.px-2.py-1.bg-gray-600.opacity-30.text-white.my-1(@click="deleteRow(row)") Удалить

Paginator.mt-3(:table="Table")

// МОДАЛКА ДОБАВЛЕНИЯ
ModalVue(ref="FlameTableModal")
  template(v-slot)
    .bg-white.rounded-xl(:class="'w-full desktop:w-[777px]'")

      slot(name="header")

      // КОЛОНКИ ТАБЛИЦЫ
      label.flex.items-stretch.justify-center.w-full.my-1.ml-2(v-for="column in ColumnNames", v-show="Table.columns[column].Popup.isShow")
        .w-44.text-left.px-2.py-1.bg-slate-100
          div {{ Table.columns[column].Popup.title !== '' ? Table.columns[column].Popup.title === '' : Table.columns[column].title !== '' ? Table.columns[column].title : Table.columns[column].name }}
          .text-xs.text-slate-400 {{ Table.columns[column].Popup.desc }}
        .flex-1.mr-5.w-full.flex.flex-col.self-stretch(v-if="Table.columns[column].Popup.popupType === 'string' || Table.columns[column].Popup.popupType === 'text'")
          input.h-full.self-stretch.py-1.px-2.w-full.outline-none.border.border-slate-100(v-model="Table.columns[column].Popup.model", type="text", :disabled="!Table.columns[column].Popup.isEnabled", :placeholder="Table.columns[column].Popup.placeholder !== '' ? Table.columns[column].Popup.placeholder : Table.columns[column].title !== '' ? Table.columns[column].title : Table.columns[column].name")
        .flex-1.mr-5.w-full.flex.flex-col.self-stretch(v-if="Table.columns[column].Popup.popupType === 'date'")
          Datepicker(v-model="Table.columns[column].Popup.model" autoApply )
        .flex-1.mr-5.w-full.flex.flex-col.self-stretch(v-if="Table.columns[column].Popup.popupType === 'selector'")
          select.h-full.self-stretch.py-1.px-2.w-full.outline-none.border.border-slate-100(v-model="Table.columns[column].Popup.model")
            option(v-for="(selectorVal, selectorKey) in Table.columns[column].Popup.Selector.values" :value="getSelector(Table.columns[column].Popup.Selector.values, selectorKey, selectorVal)[1]") {{ getSelector(Table.columns[column].Popup.Selector.values, selectorKey, selectorVal)[0] }}

      // КНОПКИ СОХРАНЕНИЯ
      .flex.w-full.mt-3.mb-2.justify-between.items-center
        .cursor-pointer.ml-2.text-lg.py-2.text-white.block.bg-gray-400.font-medium.rounded.text-sm.px-4.text-center(v-show="$props.opts?.Add.can" @click="Table.OpenedRow = null; FlameTableModal?.close()" class="hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900") Отмена
        .cursor-pointer.ml-2.text-lg.py-2.mr-3.text-white.block.bg-blue-600.font-medium.rounded.text-sm.px-4.text-center(@click="SaveTable()" class="hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900") {{ Table.mode === 'add' ? 'Добавить' : 'Сохранить' }}


  
</template>

<script lang="ts">
import { onMounted, reactive, ref, defineProps } from '@vue/runtime-core'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST, { Rows } from "flamerest"

// Иконки
import { XCircleIcon } from '@icons/24/solid'
import { computed } from '@vue/reactivity';
import { Column } from './Columns';
import { defineComponent } from 'vue';
import TableOpts from './TableOpts';
import FlameTable from './FlameTable';
import ModalVue from './../components/default/Modal.vue';
import Paginator from './Paginator.vue';
type Class<T> = new (...args: any[]) => T;

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { isNumber } from 'lodash';


export default defineComponent({
  components: { ModalVue, Paginator, Datepicker },
  props: {
    rows: {
      default: [] as Array<any>,
      type: Array<any>
    },
    opts: {
      default: new TableOpts,
      type: TableOpts
    },
    model: {
      default: null,
      type: Function
    },
  },
  setup(props) {

    const Table = new FlameTable(props.model as any, props.opts);

    const FlameTableModal = ref<InstanceType<typeof ModalVue>>();

    const ColumnNames = Object.keys(Table.model as any);

    /**
     * Добавление новой записи
     */
    const add = () => {
      Table.mode = 'add';

      // Установим все поля в пустые значения
      ColumnNames.forEach(key => {
        Table.columns[key].Popup.model = "";
      })

      FlameTableModal.value?.show();
    }

    /**
     * Редактирование записи
     */
    const edit = async (row: any) => {
      Table.mode = 'edit';

      await Table.opts.Popup.load(row, Table);

      // Установим все поля в фактические значения из таблицы
      ColumnNames.forEach(key => {
        Table.columns[key].Popup.model = row[key];
      })

      Table.OpenedRow = row;

      FlameTableModal.value?.show();
    }

    const SaveTable = async () => {

      try {
        if (Table.mode === 'add') {
          await Table.add()
        }
        else {
          await Table.save()
        }
      }
      catch (Ex) { return; }

      FlameTableModal.value?.close();

      Table.OpenedRow = null;

    }

    const deleteRow = async (row: any) => {
      if (window.confirm("Удалить запись " + row + "?")) {
        Table.remove(row);
      }
    }

    const getSelector = (arr: any, selectorKey: any, selectorVal: any) => {
      if (Array.isArray(arr)) return [selectorVal, selectorVal];
      // TODO: тут загрузка объекта должна быть
      // сейчас объект перерабатывается где-то в map и теряет ключи и значения
      if (typeof arr === 'object' && arr !== null) return [selectorKey, selectorVal]
      return [selectorKey, selectorVal]
    }

    // Автозагрузка первичной версии
    if (props.opts.autoload === true) {
      const tModel = (props.model as any)
      tModel.all().then((r: any) => {
        Table.load(r);
      })
    }

    return {
      Table,
      FlameTableModal,
      ColumnNames,
      add,
      edit,
      SaveTable,
      deleteRow,
      getSelector
    }

  },

})

</script>

<style scoped lang="scss"></style>
