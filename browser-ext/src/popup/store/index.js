import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    api_url: process.env.NODE_ENV === "development" ?
    `http://localhost:${process.env.PORT || 3000}/api/` :
    "https://olive-pass.herokuapp.com/api/",
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
