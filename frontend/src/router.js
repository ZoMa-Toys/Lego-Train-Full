import Vue from 'vue';
import Router from 'vue-router';
import swtich from './components/switchControl.vue';
import train from './components/train.vue';
import login from './components/Login.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'login',
      component: login,
    },
    {
      path: '/swtichControl',
      name: 'swtichControl',
      component: swtich,
      props: true
    },
    {
      path: '/train',
      name: 'Train',
      component: train,
    },
  ],
});
