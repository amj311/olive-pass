import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import UserApp from '../views/app/UserApp.vue'
import Dash from '../views/app/Dash.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/app',
    component: UserApp,
    children: [
      {
        path: '/',
        name: 'Dashboard',
        component: Dash,
      },
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
