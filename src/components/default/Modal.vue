<template>
  <!-- УНИВЕРСАЛЬНОЕ МОДАЛЬНОЕ ОКНО -->
  <!-- Позволяет вызывать себя через show() и close() -->
  <CustomModal class="overall" v-model="isShow" :close="close" style="z-index: 999;">
    <!-- Этот слот для замены самого окна -->
    <slot>
      <div class="bg-white rounded-xl">
        <!-- Этот слот позволяет заменить всё сразу внутри окна -->
        <slot name="inner">
          <!-- Заголовок -->
          <div class="flex items-center px-5 border-b border-b-gray-300" v-if="title !== ''">
            <h1 class="text-3xl py-5">{{ title }}</h1>
            <XCircleIcon class="ml-24 w-6 opacity-25 cursor-pointer" @click="close"></XCircleIcon>
          </div>

          <!-- Тело -->
          <div class="my-3 px-5">
            <slot name="body">
              <div class="text-left">{{ body === '' ? 'Укажите сообщение или используйте слот body' : '' }}</div>
            </slot>
          </div>

          <!-- Кнопки -->
          <slot name="buttons">
            <div class="border-t border-t-gray-300 mb-4 pt-3 pr-5 flex items-end flex-col">
              <button class="cursor-pointer ml-5 rounded-full bg-blue-700 px-4 py-1 text-white" @click="close">
                {{ closeButton === '' ? 'Закрыть' : closeButton }}
              </button>
            </div>
          </slot>
        </slot>
      </div>
    </slot>
  </CustomModal>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest";

// Иконки
import { XCircleIcon } from '@icons/24/solid'

export default defineComponent({

  components: { XCircleIcon },

  props: {
    title: {
      type: String,
      default: "",
      required: false
    },
    body: {
      type: String,
      default: "",
      required: false
    },
    closeButton: {
      type: String,
      default: "",
      required: false
    },
  },

  setup(props) {

    const isShow = ref(false)

    function show() {
      isShow.value = true
    }

    function close() {
      isShow.value = false
    }

    return {
      isShow,
      show,
      close,
    }
  },

})


</script>

<style scoped lang="scss">
.overall {
}
</style>
