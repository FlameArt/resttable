import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { createPinia } from 'pinia'
import router from "./router";

import REST from 'flamerest';
import vSelect from 'vue-select'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { vuetifyProTipTap } from './components/editor/TextEditor'

import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi';


REST.SERVER = 'http://testrest';

const vuetify = createVuetify({
   components,
   directives,
   theme: {
      defaultTheme: 'light',
   },
   icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
         mdi,
      },
   },
});


createApp(App)
   .use(createPinia())
   .use(router)
   .use(vuetify)
   .use(vuetifyProTipTap)
   .mount('#app')
