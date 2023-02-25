import Table from "./Table/Table.vue";

const plugin = {
  install(Vue: any) {
    Vue.component('RestTable', Table);
  }
}

export default plugin
