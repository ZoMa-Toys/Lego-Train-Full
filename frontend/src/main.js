import 'bootstrap/dist/css/bootstrap.css';
import { BootstrapVue} from 'bootstrap-vue';
import VueNumberInput from '@chenfengyuan/vue-number-input';
import Vue from 'vue';
import App from './App.vue';
import router from './router';



Vue.use(BootstrapVue);
Vue.component(VueNumberInput.name, VueNumberInput);
new Vue({
  router,
  render: h => h(App),
}).$mount('#app');