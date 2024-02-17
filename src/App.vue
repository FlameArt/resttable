<script setup lang="ts">
import { onMounted, reactive, defineProps } from '@vue/runtime-core'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"
import Table from './Table/Table.vue';
import { ref } from 'vue';
import Model from '@models/Testtable';
import TableOpts from './Table/TableOpts';
import Relatedtable from '@models/Relatedtable';
import SubRow from './pages/SubRow.vue';

const store = storeFile(), router = useRouter(), route = useRoute();

let notRedirectOnAuthList = [
  "Auth",
  "Signup",
  "ResetPasswordRequest",
  "ResetPassword",
];

onMounted(() => {

});

const TableComponent = ref<InstanceType<typeof Table>>();
const opts = new TableOpts;

opts.set('name', { title: 'Название' });
opts.set('dt1', { title: 'Дата 1' });
opts.set('dt2', { title: 'Дата 2' });
opts.set('id', { title: 'ID', Selector: { model: Relatedtable }, Filter: { isShow: true, type: 'selector', selector: { multiselect: true, mode: 'vertical' } } });
opts.set('file', { title: 'файл', Filter: { isShow: false } });
opts.set("name", {
  title: 'Название', Table:
  {
    isRawValue: true,
    isShow: true,
    value: (row, column) => '<a href="https://4h.notion.site/' + row[column.name].replace('-', '') + '">Notion</a>'
  },
  Popup: { isShow: true }
});


opts.addVirtual('test', { title: 'test title', Table: { isShow: true, } })
opts.addVirtual('date', { title: 'dt', Filter: { isShow: true, type: 'number' }, Table: { isShow: true, } })

opts.Add.can = true;
opts.Remove.can = true;

opts.onRowClickOpenSlot = 'rowspace';

opts.Pagination.type = 'scrollable';

opts.LoadParams.sort = ['-dt1'];

</script>

<template lang="pug">
Table(:model="Model", :opts="opts")
  template(v-slot:RowSubSlot="params")
    //| {{ params.row.name + ' LOOOONG  LOOOONG  LOOOONG  LOOOONG  LOOOONG  LOOOONG  LOOOONG  LOOOONG  LOOOONG  LOOOONG  LOOOONG  line' }}
    //SubRow
    div(class="flex items-center justify-center w-full mx-auto") AAA
  template(#otherButtons)
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Цвет стандартного фона модального окна */
.vue-universal-modal {
  background-color: rgba(0, 0, 0, 0.15) !important;
}
</style>
