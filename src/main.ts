import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { createPinia } from 'pinia'
import router from "./router";

import 'vue-universal-modal/dist/index.css'
import VueUniversalModal from 'vue-universal-modal'
import REST from 'flamerest';
import vSelect from 'vue-select'


REST.SERVER = 'http://testrest';


createApp(App)
   .use(createPinia())
   .use(router)
   .use(VueUniversalModal, { teleportTarget: '#my-modals', modalComponent: 'CustomModal' })
   .mount('#app')
