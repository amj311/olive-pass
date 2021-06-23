import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import UserApp from '../views/app/UserApp.vue'
import Creds from '../views/app/Creds.vue'
import EditCred from '../views/app/EditCred.vue'
import EmailConfirm from '../views/app/EmailConfirm.vue'
import axios from 'axios'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/email-confirm',
    name: 'EmailConfirm',
    component: EmailConfirm,
  },
  {
    path: '/app',
    component: UserApp,
    children: [
      {
        path: '/',
        name: 'Creds',
        component: Creds,
      },
      {
        path: '/edit-cred',
        name: 'EditCred',
        component: EditCred,
        props: true
      },
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
