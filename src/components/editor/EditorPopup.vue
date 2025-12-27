<template>
  <v-dialog class="z-[9999999]" v-model="state.dialog" max-width="400" persistent>
    <div class="text-slate-500">
    </div>
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps">
        Изменить
      </v-btn>
    </template>

    <v-card prepend-icon="mdi-map-marker" :title="'Изменить: ' + $props.title">

      <VuetifyTiptap ref="VuetifyTiptapRef" v-model="state.data" />


      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn @click="state.dialog = false">
          Отмена
        </v-btn>

        <v-btn @click="saveButton()">
          Сохранить
        </v-btn>
      </template>
    </v-card>
  </v-dialog>


</template>

<script lang="ts">
import { onMounted, reactive, ref, nextTick, defineComponent } from '@vue/runtime-core'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest";
import { vuetifyProTipTap } from './TextEditor'
// Иконки
import { } from '@icons/24/solid'

export default defineComponent({

  name: 'EditorPopup',

  components: { vuetifyProTipTap },

  props: {
    title: {
      type: String,
      default: "",
      required: false
    },
    column: {
      type: String,
      default: "",
      required: true
    },
    value: {
      type: String,
      default: "",
      required: true
    },
    closeButton: {
      type: String,
      default: "",
      required: false
    },
  },

  emits: [
    'save'
  ],

  setup(props, { emit }) {

    // Глобальное хранилище, роуты, локали
    const store = storeFile(), router = useRouter(), route = useRoute();

    // Входящие данные компонента
    //const emit = defineEmits(['save'])

    // Локальное состояние компонента
    const state = reactive({
      data: "",
      dialog: false
    })

    const saveButton = () => {
      state.dialog = false;
      emit('save', state.data, props.column);
    }

    state.data = props.value;

    return {
      state,
      store,
      saveButton
    }
  },

})

</script>

<style scoped lang="scss"></style>