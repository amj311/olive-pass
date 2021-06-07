import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import UserApp from '../views/app/UserApp.vue'
import Dash from '../views/app/Dash.vue'
import axios from 'axios'

Vue.use(VueRouter)

const routes = [
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
    beforeEnter: async (to,from,next) => {
      axios.get("http://localhost:3000/api/", {withCredentials:true})
        .then(res=>{
          next();
        })
        .catch(err=>{
          console.warn("You are not logged in - rerouting to home.")
          next('/');
        })
    },
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
