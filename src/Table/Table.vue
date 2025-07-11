<template>
  <div class="mt-0  overflow-x-scroll">

    <!-- ФИЛЬТРЫ -->
    <TableFilters :columns="Table.columns" :table="Table"></TableFilters>

    <!-- ПАНЕЛЬ ОПЕРАЦИЙ НАД ТАБЛИЦЕЙ -->
    <TableTasksPanel v-if="Table.opts.displayMode === 'table'" :table="Table" @add="add">
      <template #defaultButtons>
        <slot name="defaultButtons">
        </slot>
      </template>
      <template #otherButtons>
        <slot name="otherButtons">
        </slot>
      </template>

    </TableTasksPanel>

    <!-- ТАБЛИЦА-->
    <div v-if="Table.opts.displayMode === 'table'" ref="MainTableElement" class="mt-2 table table-fixed w-full ">

      <!-- ЗАГОЛОВКИ СТОЛБЦОВ-->
      <slot name="TableHeaders" :columns="Table.columns">
        <div class="table-header-group">

          <!-- ЧЕКБОКСЫ -->
          <div class="table-cell  w-[21px] align-middle">
            <label class="checkbox" v-if="Table.opts.rowSelectors">
              <input type='checkbox' @change="CheckboxSelectionChanged($event, true)">
              <span class='indicator'></span>
            </label>
          </div>

          <div v-for="column in Table.columns" v-show="column.Table.isShow" :key="'cheader_' + column.name"
            :class="' defaultHeader ' + column.Table.classesHeader"
            class=" table-cell align-middle border-r border-r-slate-100 px-2"
            :style="(column.Table.width === null ? '' : `width: ${column.Table.width}px; min-width: ${column.Table.width}px`)">
            <span>{{ column.Table.titleCustom !== null ? (column as any).Table.titleCustom(column) : column.Table.title
              !==
              '' ?
              column.Table.title : column.title !== '' ? column.title :
              column.name }}</span>
          </div>
          <div v-if="opts.Edit.can" class="table-cell  w-[93px] border-r border-r-slate-100 px-2">
            <button class="bg-green-600 invisible">
              Изменить
            </button>
          </div>
          <div v-if="opts.Remove.can" class="table-cell w-[93px] border-r border-r-slate-100 px-2">
            <button class="bg-green-600 invisible">
              Удалить
            </button>
          </div>
        </div>
      </slot>
      <!-- СТРОКИ-->

      <div class="table-row-group text-left">

        <template v-for="(row) in (Table.Rows.rows)">
          <slot name="Row" :row="row">
            <div :key="'row_' + (row as any).id" class="defaultRow table-row cursor-pointer hover:bg-slate-100"
              v-if="true">

              <!-- ЧЕКБОКСЫ -->
              <div class="table-cell align-middle w-[21px]">
                <label class="checkbox" v-if="Table.opts.rowSelectors">
                  <input type='checkbox' v-model="Table.RowsParams[(row as any)[primaryKey]].selected"
                    @change="CheckboxSelectionChanged($event, false)">
                  <span class='indicator'></span>
                </label>
              </div>

              <div v-for="column in Table.columns" v-show="column.Table.isShow" :key="'tc_' + column.name"
                :class="' defaultCell ' + column.Table.classes"
                class="table-cell align-middle border-r border-r-slate-100 px-2 last:border-r-0 last:pr-0"
                @click="columnClick(row, column)"
                :style="(column.Table.width === null ? '' : `width: ${column.Table.width}px; min-width: ${column.Table.width}px`)">

                <span v-if="!column.Table.isRawValue">{{
                  column.Table.value(row, column) }}</span>
                <span v-else v-html="column.Table.value(row, column)"></span>
              </div>
              <div v-if="opts.Edit.can" class="table-cell w-[93px]   border-r border-r-slate-100 px-2 text-center">
                <button class="px-2 py-1 bg-green-600 text-white my-1" @click="edit(row)">
                  Изменить
                </button>
              </div>
              <div v-if="opts.Remove.can" class="table-cell w-[93px]   border-r border-r-slate-100 px-2 text-center">
                <button class="px-2 py-1 bg-gray-600 opacity-30 text-white my-1" @click="deleteRow(row)">
                  Удалить
                </button>
              </div>
            </div>
          </slot>
          <div class="table-cell text-center relative" :key="'row_slot_' + (row as any).id"
            v-if="opts.onRowClickOpenSlot === 'rowspace' && !isRowCollapsed(row)">
            <div class=" mx-auto  no-wrap-cell mobile:w-full text-center">
              <slot name="RowSubSlot" :row="row" />
            </div>
          </div>
        </template>

      </div>

    </div>

    <!-- CUSTOM ROWS -->
    <div v-if="Table.opts.displayMode === 'custom'" ref="MainTableElement" class="mt-2 w-full">
      <template v-for="(row, index) in (Table.Rows.rows)" :key="'custom_row_' + (row as any)[primaryKey] + '_' + index">
        <slot name="CustomRow" :row="row" :edit="() => edit(row)" :remove="() => deleteRow(row)" :table="Table" />
      </template>
    </div>

  </div>

  <!-- ПОСТРАНИЧНАЯ РАЗБИВКА -->
  <Paginator class="mt-3" :table="Table" v-if="opts.Pagination.type === 'pages'" />

  <!-- МОДАЛКА ДОБАВЛЕНИЯ-->
  <ModalVue ref="FlameTableModal">
    <template #default>
      <div class="bg-white rounded-xl" :class="'w-full desktop:w-[777px]'">

        <!-- СЛОТ ЗАГОЛОВКА ПОПАПА -->
        <slot name="header" />

        <!-- КОЛОНКИ ТАБЛИЦЫ-->
        <label v-for="column in ColumnNames" v-show="Table.columns[column].Popup.isShow" :key="'c' + column"
          class="flex items-stretch justify-center w-full my-1 ml-2">

          <!-- Заголовок -->
          <div class="text-left px-2 py-1 bg-slate-100" style="width: 110px">
            <div>{{ Table.columns[column].Popup.title !== '' ? Table.columns[column].Popup.title === '' :
              Table.columns[column].title !== '' ? Table.columns[column].title : Table.columns[column].name }}</div>
            <div class="text-xs text-slate-400">{{ Table.columns[column].Popup.desc }}</div>
          </div>

          <div v-if="Table.columns[column].Popup.popupType === 'string'"
            class="flex-1 mr-5 w-full flex flex-col self-stretch">
            <input v-model="Table.columns[column].Popup.model"
              class="h-full self-stretch py-1 px-2 w-full outline-none border border-slate-100" type="text"
              :disabled="!Table.columns[column].Popup.isEnabled"
              :placeholder="Table.columns[column].Popup.placeholder !== '' ? Table.columns[column].Popup.placeholder : Table.columns[column].title !== '' ? Table.columns[column].title : Table.columns[column].name">
          </div>

          <div v-if="Table.columns[column].Popup.popupType === 'date'"
            class="flex-1 mr-5 w-full flex flex-col self-stretch">
            <Datepicker v-model="Table.columns[column].Popup.model" :auto-apply="true" />
          </div>

          <div v-if="Table.columns[column].Popup.popupType === 'selector'"
            class="flex-1 mr-5 w-full flex flex-col self-stretch">
            <v-select v-model="Table.columns[column].Popup.model"
              :items="Table.columns[column].Popup.Selector.values" item-title="title" item-value="id"
              density="compact" hide-details>
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

          <!-- КАРТИНКА -->
          <div v-if="Table.columns[column].Popup.popupType === 'image'"
            class="flex-1 border border-slate-100 mr-5 w-full flex self-stretch">
            <div class="flex-1">
              <img class="max-w-[200px]" :src="fileGetData(Table.columns[column].Popup.model, true)">
            </div>

            <!-- Загрузчик-->
            <label :for="'cfile_' + column">

              <svg class="my-auto cursor-pointer" width="24" height="24" viewbox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M11.4697 2.46967C11.7626 2.17678 12.2374 2.17678 12.5303 2.46967L17.0303 6.96967C17.3232 7.26256 17.3232 7.73744 17.0303 8.03033C16.7374 8.32322 16.2626 8.32322 15.9697 8.03033L12.75 4.81066L12.75 16.5C12.75 16.9142 12.4142 17.25 12 17.25C11.5858 17.25 11.25 16.9142 11.25 16.5L11.25 4.81066L8.03033 8.03033C7.73744 8.32322 7.26256 8.32322 6.96967 8.03033C6.67678 7.73744 6.67678 7.26256 6.96967 6.96967L11.4697 2.46967ZM3 15.75C3.41421 15.75 3.75 16.0858 3.75 16.5V18.75C3.75 19.5784 4.42157 20.25 5.25 20.25H18.75C19.5784 20.25 20.25 19.5784 20.25 18.75V16.5C20.25 16.0858 20.5858 15.75 21 15.75C21.4142 15.75 21.75 16.0858 21.75 16.5V18.75C21.75 20.4069 20.4069 21.75 18.75 21.75H5.25C3.59315 21.75 2.25 20.4069 2.25 18.75V16.5C2.25 16.0858 2.58579 15.75 3 15.75Z"
                  fill="#0F172A" />
              </svg>

              <input class="hidden" :name="'cfile_' + column" type="file" @change="fileUpdated(column, $event)">

            </label>
          </div>

          <!-- ФАЙЛЫ -->
          <div v-if="Table.columns[column].Popup.popupType === 'file'"
            class="flex-1 border border-slate-100 mr-5 w-full flex self-stretch">

            <div class="flex-1">
              {{ getFileName(Table.columns[column].Popup.model) }}
            </div>

            <!-- Загрузчик-->
            <label :for="'cfile_' + column">

              <svg class="my-auto cursor-pointer" width="24" height="24" viewbox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M11.4697 2.46967C11.7626 2.17678 12.2374 2.17678 12.5303 2.46967L17.0303 6.96967C17.3232 7.26256 17.3232 7.73744 17.0303 8.03033C16.7374 8.32322 16.2626 8.32322 15.9697 8.03033L12.75 4.81066L12.75 16.5C12.75 16.9142 12.4142 17.25 12 17.25C11.5858 17.25 11.25 16.9142 11.25 16.5L11.25 4.81066L8.03033 8.03033C7.73744 8.32322 7.26256 8.32322 6.96967 8.03033C6.67678 7.73744 6.67678 7.26256 6.96967 6.96967L11.4697 2.46967ZM3 15.75C3.41421 15.75 3.75 16.0858 3.75 16.5V18.75C3.75 19.5784 4.42157 20.25 5.25 20.25H18.75C19.5784 20.25 20.25 19.5784 20.25 18.75V16.5C20.25 16.0858 20.5858 15.75 21 15.75C21.4142 15.75 21.75 16.0858 21.75 16.5V18.75C21.75 20.4069 20.4069 21.75 18.75 21.75H5.25C3.59315 21.75 2.25 20.4069 2.25 18.75V16.5C2.25 16.0858 2.58579 15.75 3 15.75Z"
                  fill="#0F172A" />
              </svg>

              <input class="hidden" :name="'cfile_' + column" type="file" @change="fileUpdated(column, $event)">

            </label>
          </div>

          <div class="flex-1 mr-5 w-full flex flex-col self-stretch"
            v-if="Table.columns[column].Popup.popupType === 'text'">
            <EditorPopup :value="Table.columns[column].Popup.model" @save="PopupTextSaved" :column="column" :title="Table.columns[column].Popup.title ?? column">

            </EditorPopup>
          </div>

          <!-- ОШИБКИ СОХРАНЕНИЯ -->
          <div class="mx-2 my-1 text-red-600" v-if="(typeof popupErrors[column]!== 'undefined')">{{ popupErrors[column]
            }}</div>

        </label>

        <div class="text-red-600 mx-2 my-1" v-if="(typeof popupErrors['globalErrorStack']!== 'undefined')">{{
          popupErrors['globalErrorStack'] }}</div>

        <!-- КНОПКИ СОХРАНЕНИЯ-->
        <div class="flex w-full mt-3 mb-2 justify-between items-center">
          <div v-show="$props.opts?.Add.can"
            class="cursor-pointer ml-2 text-lg py-2 text-white block bg-gray-400 font-medium rounded px-4 text-center hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
            @click="Table.OpenedRow = null; FlameTableModal?.close()">
            Отмена
          </div>
          <div
            class="cursor-pointer ml-2 text-lg py-2 mr-3 text-white block bg-blue-600 font-medium rounded px-4 text-center hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
            @click=" SaveTable()">
            {{ Table.mode === 'add' ? 'Добавить' : 'Сохранить' }}
          </div>
        </div>
      </div>
    </template>
  </ModalVue>
</template>

<script lang="ts">
import { onMounted, reactive, ref, defineProps } from '@vue/runtime-core'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST, { Rows } from "flamerest"

// Иконки
import { computed } from '@vue/reactivity';
import { Column, IColumn } from './Columns';
import { defineComponent } from 'vue';

import TableOpts from './TableOpts';
import FlameTable from './FlameTable';
import ModalVue from './../components/default/Modal.vue';
import Paginator from './Paginator.vue';
import TableFilters from './TableFilters.vue';
type Class<T> = new (...args: any[]) => T;

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { isNumber } from 'lodash';
import TableTasksPanel from './TableTasksPanel.vue';
import EditorPopup from '../components/editor/EditorPopup.vue';

export default defineComponent({
  components: { ModalVue, Paginator, Datepicker, TableFilters, TableTasksPanel, EditorPopup },
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

    const Table = (new FlameTable(props.model as any, props.opts)) as FlameTable<any>;

    const FlameTableModal = ref<InstanceType<typeof ModalVue>>();

    const ColumnNames = Object.keys(Table.columns);

    // Ошибки сохранения
    let popupErrors: { [key: string]: string } = reactive({});

    // Добавляем событие скролла

    /**
     * Добавление новой записи
     */
    const add = () => {
      Table.mode = 'add';

      // Установим все поля в пустые значения
      ColumnNames.forEach(key => {
        Table.columns[key].Popup.model = "";
        Table.columns[key].Popup.fileModel = null;
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

        if (Table.columns[key].Popup.popupType === 'file' || Table.columns[key].Popup.popupType === 'image')
          Table.columns[key].Popup.fileModel = row[key];

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
        popupErrors={};
      }
      catch (ex: any) {

        for (const keyx in popupErrors)
          delete popupErrors[keyx];

        if(typeof ex.stack !== 'undefined' && typeof ex.message !== 'undefined') {
          popupErrors.globalErrorStack = ex.message;
        }
        else
          Object.assign(popupErrors, ex);

        return;
      }

      FlameTableModal.value?.close();

      Table.OpenedRow = null;

    }

    const deleteRow = async (row: any) => {
      if (window.confirm("Удалить запись " + row + "?")) {
        Table.remove(row);
      }
    }

    const fileUpdated = async (column: any, ev: any) => {
      // если файлы не выбраны
      if (ev.target.files.length === 0) return;

      Table.columns[column].Popup.model = ev;
      const prepared = (await REST.prepare({ myParam: ev })).myParam;
      Table.columns[column].Popup.model = prepared
      Table.columns[column].Popup.fileModel = ev
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

    // Автозагрузка первичной версии
    if (props.opts.autoload === true) {
      /**
      const tModel = (props.model as any)
      tModel.all().then((r: any) => {
        Table.load(r);
      })*/
      Table.update();
    }

    const primaryKey = (Table.model as any).constructor.primaryKeys[0];

    const columnClick = (row: any, column: Column) => {
      switch (Table.opts.onRowClickOpenSlot) {
        case 'rowspace':
          Table.RowsParams[row[primaryKey]].collapsed = !Table.RowsParams[row[primaryKey]].collapsed
          break;
        case 'popup':
          Table.RowsParams[row[primaryKey]].collapsed = !Table.RowsParams[row[primaryKey]].collapsed
          break;
        default:
          if (column?.Table?.click !== undefined)
            column.Table.click(row, column);
          break;
      }

    }
    const isRowCollapsed = (row: any) => {
      return Table.RowsParams[row[primaryKey]].collapsed
    }

    const PopupTextSaved = (txt: string, column: string)=> {
      Table.columns[column].Popup.model = txt;
    }

    const MainTableElement = ref();



    return {
      Table,
      FlameTableModal,
      ColumnNames,
      add,
      edit,
      SaveTable,
      deleteRow,
      fileUpdated,
      primaryKey,
      columnClick,
      isRowCollapsed,
      MainTableElement,

      // TODO: проверить
      popupErrors,

      PopupTextSaved
    }

  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  methods: {


    // подскролл таблицы при докручивании до низа
    handleScroll() {

      if (this.opts.Pagination.type !== 'scrollable') return;
      if (this.Table.loadingStatus === 'process') return;

      const rect = this.MainTableElement.getBoundingClientRect();
      const bottom = rect.bottom;

      // Получаем высоту окна просмотра
      const windowHeight = window.innerHeight;

      // Проверяем, достиг ли скролл нижней грани элемента
      if (bottom <= windowHeight) {
        // Грузим на одну страницу дальше
        this.Table.update({ page: this.Table.Pager.page + 1, perPage: this.Table.Pager.perPage });
      }

    },

    fileGetData(thisArr: any, getSource: boolean = true) {



      if (thisArr instanceof Array && thisArr.length > 0) {
        // Получить строку с исходником
        if (getSource) {
          if (typeof thisArr[0].data === 'string') return thisArr[0].data;
          if (typeof thisArr[0].file === 'string') return REST.SERVER + "/" + thisArr[0].file;
          return "";
        }
        // Получить данные целиком
        return thisArr[0]
      }

      return null

    },

    getFileName(fileModel: any) {
      const res = this.fileGetData(fileModel, false)
      if (res?.name) {
        if (typeof res.name === 'string' && res.name !== '') {
          return res.name;
        }
        else {
          if (res.file) {
            const splitted = res.file.split('.');
            return 'File.' + splitted[splitted.length - 1];
          }
        }
      }
    },

    CheckboxSelectionChanged(event: any, all: boolean = false) {
      if (all === true)
        for (const key in this.Table.RowsParams) {
          this.Table.RowsParams[key].selected = event.target.checked
        }

      this.Table.getSelectedRows();

      // ТУТ СОБЫТИЕ ОБ ИЗМЕНЕНИИ ПРИХОДИТ В ИСТАНС РАНЬШЕ САМОГО ИЗМЕНЕНИЯ МАССИВА

    }
  },

})

</script>

<style scoped lang="scss">
.no-wrap-cell {
  white-space: nowrap !important;
}

.defaultHeader {
  color: rgba(55, 53, 47, 0.65);
  font-size: 14px;
  line-height: 16.8px;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
}

.defaultRow {
  color: rgb(55, 53, 47);
  font-size: 14px;
  line-height: 16.8px;
  font-family: "Roboto", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
  border: 1px solid rgb(233, 233, 231);
}

// ЧЕКБОКСЫ
$black: #2D3137;
$blue: #3785BC;
$green: #329E78;
$grey: #D6D6D6;
$red: #DD3C3A;
$white: #FFFFFF;

$border-radius: 3px;

@mixin checkbox($color) {
  //margin-right: 1rem;
  padding-left: 1.75rem;
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    &:focus~span {
      border: 2px solid lighten($black, 50%);
    }

    &:focus:checked~span {
      border: 2px solid darken($color, 15%);
    }

    &:checked~span {
      color: $white;
      background: $color url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnIHdpZHRoPSIxMiIgaGVpZ2h0PSI5IiB2aWV3Qm94PSIwIDAgMTIgOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPHBhdGggZD0iTTQuNTc1IDguOTc3cy0uNDA0LS4wMDctLjUzNi0uMTY1TC4wNTcgNS42NGwuODI5LTEuMjI3TDQuNDcgNy4yNjggMTAuOTIxLjA4NmwuOTIzIDEuMTAzLTYuODYzIDcuNjRjLS4xMzQtLjAwMy0uNDA2LjE0OC0uNDA2LjE0OHoiIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPg0KPC9zdmc+) 50% 40% no-repeat;
      border: 2px solid $color;
    }

  }

  span {
    border-radius: $border-radius;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1.09rem;
    height: 1.09rem;
    background-color: lighten($black, 65%);
    border: 1px solid lighten($black, 65%);
    pointer-events: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
}

label.checkbox {
  @include checkbox($green);

  &.blue {
    @include checkbox($blue);
  }

  &.red {
    @include checkbox($red);
  }
}
</style>
