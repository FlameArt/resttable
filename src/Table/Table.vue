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
  <TablePopup :table="Table" ref="FlameTablePopup"></TablePopup>
</template>

<script lang="ts">
import { onMounted, reactive, ref, defineProps } from '@vue/runtime-core'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST, { Rows } from "flamerest"

// Иконки
import { computed } from '@vue/reactivity';
import { Column, IColumn } from './Columns';
import { defineComponent } from 'vue';

import TableOpts from './TableOpts';
import FlameTable from './FlameTable';
import Paginator from './Paginator.vue';
import TableFilters from './TableFilters.vue';
type Class<T> = new (...args: any[]) => T;

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { isNumber } from 'lodash';
import TableTasksPanel from './TableTasksPanel.vue';
import TablePopup, { type TablePopupInstance } from './TablePopup.vue';

export default defineComponent({
  components: { Paginator, Datepicker, TableFilters, TableTasksPanel, TablePopup },
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

    const FlameTablePopup = ref<TablePopupInstance>();

    const ColumnNames = Object.keys(Table.columns);

    /**
     * Добавление новой записи
     */
    const add = () => {
      FlameTablePopup.value?.showAdd();
    }

    /**
     * Редактирование записи
     */
    const edit = async (row: any) => {
      FlameTablePopup.value?.showEdit(row);
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

    const MainTableElement = ref();

    return {
      Table,
      FlameTablePopup,
      ColumnNames,
      add,
      edit,
      deleteRow,
      primaryKey,
      columnClick,
      isRowCollapsed,
      MainTableElement,
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

    CheckboxSelectionChanged(event: any, all: boolean = false) {
      if (all === true)
        for (const key in this.Table.RowsParams) {
          this.Table.RowsParams[key].selected = event.target.checked
        }

      this.Table.getSelectedRows();

      // ТУТ СОБЫТИЕ ОБ ИЗМЕНЕНИИ ПРИХОДИТ В ИСТАНС РАНШЬЕ САМОГО ИЗМЕНЕНИЯ МАССИВА

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
