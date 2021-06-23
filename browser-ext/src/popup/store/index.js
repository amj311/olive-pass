import Vue from 'vue'
import Vuex from 'vuex'
import { Request, Action } from '../../lib/Messages'
import AlertManager from '../AlertManager'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    api_url: process.env.NODE_ENV === "development" ?
      `http://localhost:${process.env.PORT || 3000}/api/` :
      process.env.API_URL,
    userData: null,
    alertManager: new AlertManager(),
  },
  mutations: {
    userData(state, data) {
      state.userData = data;
      let req = new Request(Action.SET_STORAGE, {'op-lastUserData': data});
      chrome.runtime.sendMessage(req, async function(res) {});
    },
    logout(state) {
      state.userData = null;
    }
  },
  actions: {
  },
  modules: {
  }
})
