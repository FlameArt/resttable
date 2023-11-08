<template lang="pug">
nav.relative.z-0.w-full.fc.flex-wrap.rounded-md.-space-x-px(aria-label='Pagination' @click="")
  a.relative.inline-flex.items-center.px-2.py-2.rounded-l-md.border.border-gray-300.bg-white.text-sm.font-medium.text-gray-500(@click="goPage(props.table.Pager.page-1)" :class="props.table.Pager.page === 1 ? 'opacity-30' : 'cursor-pointer'" class='hover:bg-gray-50')
    span.sr-only Previous
    // Heroicon name: solid/chevron-left
    svg.h-5.w-5(xmlns='http://www.w3.org/2000/svg' viewbox='0 0 20 20' fill='currentColor' aria-hidden='true')
      path(fill-rule='evenodd' d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z' clip-rule='evenodd')
  // Current: "z-10 bg-indigo-50 border-indigo-500 text-indigo-600", Default: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
  a.cursor-pointer.bg-white.border-gray-300.text-gray-500.relative.inline-flex.items-center.px-4.py-2.border.text-sm.font-medium(v-for="page in props.table.Pager.count" class="hover:bg-gray-50" :class="props.table.Pager.page === page ? 'selectedPage' : ''" @click="goPage(page)")
    | {{ page }}
  //span.relative.inline-flex.items-center.px-4.py-2.border.border-gray-300.bg-white.text-sm.font-medium.text-gray-700  ... 
  a.relative.inline-flex.items-center.px-2.py-2.rounded-r-md.border.border-gray-300.bg-white.text-sm.font-medium.text-gray-500(@click="goPage(props.table.Pager.page+1)" :class="props.table.Pager.page >= props.table.Pager.count ? 'opacity-30' : 'cursor-pointer'" class='hover:bg-gray-50')
    span.sr-only Next
    // Heroicon name: solid/chevron-right
    svg.h-5.w-5(xmlns='http://www.w3.org/2000/svg' viewbox='0 0 20 20' fill='currentColor' aria-hidden='true')
      path(fill-rule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clip-rule='evenodd')


</template>

<script setup lang="ts">
import { onMounted, reactive, ref, defineProps } from '@vue/runtime-core'; import type { Ref } from 'vue'; import { storeFile } from "@/store"; import { useRoute, useRouter } from 'vue-router'; import REST from "flamerest"

// Иконки
import { XCircleIcon } from '@icons/24/solid'
import FlameTable from './FlameTable';

// Глобальное хранилище и роуты
const store = storeFile(), router = useRouter(), route = useRoute();

// Локальное состояние компонента
const state = reactive({
  data: {}
})

// Входящие данные компонента
const props = defineProps<{
  table: FlameTable<any>
}>()


// Примонтировано
onMounted(async () => {

})

const goPage = (page: number) => {
  if (page > props.table.Pager.count || page <= 0) return;
  // eslint-disable-next-line vue/no-mutating-props
  props.table.Pager.page = page;
  props.table.update();
}

</script>

<style scoped lang="scss">
.selectedPage {
  @apply z-10 bg-indigo-50 border-indigo-500 text-indigo-600
}
</style>
