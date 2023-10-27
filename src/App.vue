<script setup lang="ts">
import { onMounted, reactive, defineProps } from '@vue/runtime-core'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"
import Table from './Table/Table.vue';
import { ref } from 'vue';
import Model from '@models/Testtable';
import TableOpts from './Table/TableOpts';

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
opts.Add.can = true;
opts.Remove.can = true;

// Загружаем первичные данные
Model.all({ sort: ['id'] }).then(r =>
  TableComponent.value?.Table.load(r)
)

</script>

<template lang="pug">
Table(:model="Model", :opts="opts")
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
