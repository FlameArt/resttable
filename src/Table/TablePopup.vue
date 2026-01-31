<template>
  <v-dialog v-model="isDialogVisible" max-width="777px">
    <v-card>
      <v-card-title>Тестовый диалог</v-card-title>
      <v-card-text>
        Если вы видите это окно, значит, проблема в его содержимом.
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey" variant="text" @click="close">
          Закрыть
        </v-btn>
      </v-card-actions>
      <!--
      <slot name="header" />

      <v-card-text>
        
        <div v-for="column in ColumnNames" v-show="Table.columns[column].Popup.isShow" :key="'c' + column"
          style="margin-bottom: 10px;">

          <v-text-field v-if="Table.columns[column].Popup.popupType === 'string'"
            v-model="Table.columns[column].Popup.model"
            :disabled="!Table.columns[column].Popup.isEnabled"
            :label="Table.columns[column].Popup.title || Table.columns[column].title || Table.columns[column].name"
            :placeholder="Table.columns[column].Popup.placeholder" :hint="Table.columns[column].Popup.desc"
            persistent-hint density="compact" variant="outlined" hide-details="auto" />

          <div v-if="Table.columns[column].Popup.popupType === 'date'">
            <div class="text-sm text-gray-500 mb-1">{{ Table.columns[column].Popup.title || Table.columns[column].title
              || Table.columns[column].name }}</div>
            <Datepicker v-model="Table.columns[column].Popup.model" :auto-apply="true" />
            <div class="text-xs text-slate-400 mt-1">{{ Table.columns[column].Popup.desc }}</div>
          </div>

          <v-select v-if="Table.columns[column].Popup.popupType === 'selector'"
            v-model="Table.columns[column].Popup.model"
            :items="Table.columns[column].Popup.Selector.values" item-title="title" item-value="id"
            :label="Table.columns[column].Popup.title || Table.columns[column].title || Table.columns[column].name"
            :hint="Table.columns[column].Popup.desc" persistent-hint density="compact" hide-details="auto">
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

          
          <div v-if="Table.columns[column].Popup.popupType === 'image'">
            <div class="text-sm text-gray-500 mb-1">{{ Table.columns[column].Popup.title || Table.columns[column].title
              || Table.columns[column].name }}</div>
            <div class="border border-slate-100 flex self-stretch">
              <div class="flex-1">
                <img class="max-w-[200px]" :src="fileGetData(Table.columns[column].Popup.model, true)">
              </div>

              
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
            <div class="text-xs text-slate-400 mt-1">{{ Table.columns[column].Popup.desc }}</div>
          </div>


          
          <div v-if="Table.columns[column].Popup.popupType === 'file'">
            <div class="text-sm text-gray-500 mb-1">{{ Table.columns[column].Popup.title || Table.columns[column].title
              || Table.columns[column].name }}</div>
            <div class="border border-slate-100 flex self-stretch">

              <div class="flex-1">
                {{ getFileName(Table.columns[column].Popup.model) }}
              </div>

              
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
            <div class="text-xs text-slate-400 mt-1">{{ Table.columns[column].Popup.desc }}</div>
          </div>

          <div v-if="Table.columns[column].Popup.popupType === 'text'">
            <div class="text-sm text-gray-500 mb-1">{{ Table.columns[column].Popup.title || Table.columns[column].title
              || Table.columns[column].name }}</div>
            <EditorPopup :value="Table.columns[column].Popup.model" @save="PopupTextSaved" :column="column"
              :title="Table.columns[column].Popup.title ?? column">
            </EditorPopup>
            <div class="text-xs text-slate-400 mt-1">{{ Table.columns[column].Popup.desc }}</div>
          </div>


          
          <div class="mx-2 my-1 text-red-600" v-if="(typeof popupErrors[column] !== 'undefined')">{{ popupErrors[column]
          }}</div>

        </div>
      </v-card-text>

      <div class="text-red-600 mx-2 my-1" v-if="(typeof popupErrors['globalErrorStack'] !== 'undefined')">{{
        popupErrors['globalErrorStack'] }}</div>

      
      <v-card-actions>
        <v-btn color="grey" variant="text" @click="close">
          Отмена
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="SaveTable">
          {{ Table.mode === 'add' ? 'Добавить' : 'Сохранить' }}
        </v-btn>
      </v-card-actions>
      -->
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { onMounted, reactive, ref, watch, nextTick } from '@vue/runtime-core'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST, { Rows } from "flamerest"

// Иконки
import { computed } from '@vue/reactivity';
import { Column, IColumn } from './Columns';
import { defineComponent } from 'vue';

import TableOpts from './TableOpts';
import FlameTable from './FlameTable';

type Class<T> = new (...args: any[]) => T;

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { isNumber } from 'lodash';
import EditorPopup from '../components/editor/EditorPopup.vue';

export interface TablePopupInstance {
  showAdd: () => void;
  showEdit: (row: any) => void;
}

export default defineComponent({
  components: { Datepicker, EditorPopup },
  props: {
    table: {
      required: true,
      type: FlameTable
    },
  },

  setup(props, { expose }) {

    const Table = props.table as FlameTable<any>;
    const isDialogVisible = ref(false);
    const ColumnNames = Object.keys(Table.columns);

    // Ошибки сохранения
    let popupErrors: { [key: string]: string } = reactive({});

    /**
     * Добавление новой записи
     */
    const showAdd = () => {
      Table.mode = 'add';

      // Установим все поля в пустые значения
      ColumnNames.forEach(key => {
        const col = Table.columns[key];
        if (col.Popup.popupType === 'selector' && col.Popup.Selector.allowNull) {
          col.Popup.model = null;
        } else {
          col.Popup.model = "";
        }
        col.Popup.fileModel = null;
      })

      isDialogVisible.value = true;
    }

    /**
     * Редактирование записи
     */
    const showEdit = async (row: any) => {
      Table.mode = 'edit';

      await Table.opts.Popup.load(row, Table);


      // Установим все поля в фактические значения из таблицы
      ColumnNames.forEach(key => {
        if (row.hasOwnProperty(key)) {
          if (Table.columns[key].Popup.popupType === 'file' || Table.columns[key].Popup.popupType === 'image')
            Table.columns[key].Popup.fileModel = row[key];

          Table.columns[key].Popup.model = row[key];
        } else {
          console.warn(`[FlameTable Debug] Column "${key}" configured in frontend but not found in the received row data. Skipping assignment for this field.`);
        }
      })

      Table.OpenedRow = row;

      isDialogVisible.value = true;
    }

    const close = () => {
      Table.OpenedRow = null;
      isDialogVisible.value = false;
    }

    const SaveTable = async () => {

      try {
        if (Table.mode === 'add') {
          await Table.add()
        }
        else {
          await Table.save()
        }
        popupErrors = {};
      }
      catch (ex: any) {

        for (const keyx in popupErrors)
          delete popupErrors[keyx];

        if (typeof ex.stack !== 'undefined' && typeof ex.message !== 'undefined') {
          popupErrors.globalErrorStack = ex.message;
        }
        else
          Object.assign(popupErrors, ex);

        return;
      }

      close();

    }

    const fileUpdated = async (column: any, ev: any) => {
      // если файлы не выбраны
      if (ev.target.files.length === 0) return;

      Table.columns[column].Popup.model = ev;
      const prepared = (await REST.prepare({ myParam: ev })).myParam;
      Table.columns[column].Popup.model = prepared
      Table.columns[column].Popup.fileModel = ev
    }

    const PopupTextSaved = (txt: string, column: string) => {
      Table.columns[column].Popup.model = txt;
    }

    expose({
      showAdd,
      showEdit
    })


    return {
      Table,
      isDialogVisible,
      ColumnNames,
      SaveTable,
      fileUpdated,
      popupErrors,
      PopupTextSaved,
      close
    }

  },

  methods: {
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
  },

})

</script> 