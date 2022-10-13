import Table from "./Table/Table.vue";

const plugin = {
  install(Vue: any) {
    Vue.component('RESTTable', Table);
  }
}

export default plugin
