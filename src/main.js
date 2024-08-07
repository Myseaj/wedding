import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader

const vuetify = createVuetify({
  theme: {
    defaultTheme:'light'
  },
  components,
  directives,
})

createApp(App).use(vuetify).mount('#app')

