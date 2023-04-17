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
      .table-cell.border-r.border-r-slate-100.px-2(v-for="column in Table.columns" :key="'cheader_'+column"  v-show="column.Table.isShow")
        span {{ column.title !== '' ? column.title : column.name }}
      .table-cell.border-r.border-r-slate-100.px-2(v-if="opts.Edit.can")
        button.bg-green-600.invisible Изменить
      .table-cell.border-r.border-r-slate-100.px-2(v-if="opts.Remove.can")
        button.bg-green-600.invisible Удалить

    // СТРОКИ
    .table-row-group
      .table-row.cursor-pointer(v-for="row in (Table.Rows.rows)" :key="'row_'+(row as any).id" class="hover:bg-slate-100")
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
      label.flex.items-stretch.justify-center.w-full.my-1.ml-2(v-for="column in ColumnNames", :key="'c'+column", v-show="Table.columns[column].Popup.isShow")
        .text-left.px-2.py-1.bg-slate-100(style="width: 110px")
          div {{ Table.columns[column].Popup.title !== '' ? Table.columns[column].Popup.title === '' : Table.columns[column].title !== '' ? Table.columns[column].title : Table.columns[column].name }}
          .text-xs.text-slate-400 {{ Table.columns[column].Popup.desc }}
        .flex-1.mr-5.w-full.flex.flex-col.self-stretch(v-if="Table.columns[column].Popup.popupType === 'string' || Table.columns[column].Popup.popupType === 'text'")
          input.h-full.self-stretch.py-1.px-2.w-full.outline-none.border.border-slate-100(v-model="Table.columns[column].Popup.model", type="text", :disabled="!Table.columns[column].Popup.isEnabled", :placeholder="Table.columns[column].Popup.placeholder !== '' ? Table.columns[column].Popup.placeholder : Table.columns[column].title !== '' ? Table.columns[column].title : Table.columns[column].name")
        .flex-1.mr-5.w-full.flex.flex-col.self-stretch(v-if="Table.columns[column].Popup.popupType === 'date'")
          Datepicker(v-model="Table.columns[column].Popup.model" autoApply )
        .flex-1.mr-5.w-full.flex.flex-col.self-stretch(v-if="Table.columns[column].Popup.popupType === 'selector'")
          select.h-full.self-stretch.py-1.px-2.w-full.outline-none.border.border-slate-100(v-model="Table.columns[column].Popup.model")
            option(v-for="(selectorVal, selectorKey) in Table.columns[column].Popup.Selector.values" :key="'sel_' + selectorKey" :value="getSelector(Table.columns[column].Popup.Selector.values, selectorKey, selectorVal)[1]") {{ getSelector(Table.columns[column].Popup.Selector.values, selectorKey, selectorVal)[0] }}
        .flex-1.border.border-slate-100.mr-5.w-full.flex.self-stretch(v-if="Table.columns[column].Popup.popupType === 'image'")
          div.flex-1
            img(:src='fileGetData(Table.columns[column].Popup.model)')
          // Загрузчик
          label(:for="'cfile_'+column")
            svg.my-auto.cursor-pointer(width='24' height='24' viewbox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg')
              path(fill-rule='evenodd' clip-rule='evenodd' d='M11.4697 2.46967C11.7626 2.17678 12.2374 2.17678 12.5303 2.46967L17.0303 6.96967C17.3232 7.26256 17.3232 7.73744 17.0303 8.03033C16.7374 8.32322 16.2626 8.32322 15.9697 8.03033L12.75 4.81066L12.75 16.5C12.75 16.9142 12.4142 17.25 12 17.25C11.5858 17.25 11.25 16.9142 11.25 16.5L11.25 4.81066L8.03033 8.03033C7.73744 8.32322 7.26256 8.32322 6.96967 8.03033C6.67678 7.73744 6.67678 7.26256 6.96967 6.96967L11.4697 2.46967ZM3 15.75C3.41421 15.75 3.75 16.0858 3.75 16.5V18.75C3.75 19.5784 4.42157 20.25 5.25 20.25H18.75C19.5784 20.25 20.25 19.5784 20.25 18.75V16.5C20.25 16.0858 20.5858 15.75 21 15.75C21.4142 15.75 21.75 16.0858 21.75 16.5V18.75C21.75 20.4069 20.4069 21.75 18.75 21.75H5.25C3.59315 21.75 2.25 20.4069 2.25 18.75V16.5C2.25 16.0858 2.58579 15.75 3 15.75Z' fill='#0F172A')
            input.hidden(:name="'cfile_'+column" type="file" @change="fileUpdated(column, $event)")



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

    const fileUpdated = async (column: any, ev: any) => {
      Table.columns[column].Popup.model = ev;
      const prepared = (await REST.prepare({ myParam: ev })).myParam;
      Table.columns[column].Popup.model = prepared
    }

    /*
    const fileGetData = (model: any) => {
      return computed(r => {
        if (model instanceof Array && model.length > 0) {
          if (typeof model[0].data === 'string') return model[0].data;
          if (typeof model[0].file === 'string') return model[0].file;
        }
        return "";
      })
    }*/

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
      fileUpdated,
      getSelector
    }

  },
  methods: {
    fileGetData(thisArr: any) {

      if (thisArr instanceof Array && thisArr.length > 0) {
        if (typeof thisArr[0].data === 'string') return thisArr[0].data;
        if (typeof thisArr[0].file === 'string') return thisArr[0].file;
      }
      return "";

    }
  },

})

</script>

<style scoped lang="scss"></style>
