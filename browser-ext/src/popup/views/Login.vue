<template>
  <div>
    <div v-if="mode === 'password'">
      <div v-if="previousUser">
        <p>
          <button id="startOtc" @click="startOtc">
            <b>Quick Login</b>
            <br>
            <small>({{previousUser.email}})</small>
          </button>
        </p>
        <p>- or -</p>
      </div>
      <input v-model="email" placeholder="Email" type="email" />
      <input v-model="password" placeholder="Password" type="password" />
      <br>
      <button @click.prevent="login">Login</button>
    </div>

    <div v-if="mode === 'otc'">
      <p>Login with the one-time code that has been sent to {{previousUser.email}}.</p>
      <OTCForm :length="codeLength" :buttonText="'Login'" @submit="attemptOtc" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import OTCForm from '../../components/OTCForm.vue'
import { Request, Action } from '../../lib/Messages'
import Constants from '../../../../model/Constants'

export default {
  name: 'Login',
  components: {
    OTCForm
  },
  data() { return {
    email: "",
    password: "",
    previousUser: null,
    mode: "password",
    codeLength: Constants.LoginCodeLength,
  }},
  beforeMount(){
    let ctx = this;
    let req = new Request(Action.GET_STORAGE, 'op-lastUserData');
    chrome.runtime.sendMessage(req, async function(res) {
      ctx.previousUser = res['op-lastUserData'];
    });
  },
  methods: {
    setMode(mode) {
      this.mode = mode;
    },
    
    login() {
      axios.post(this.$store.state.api_url+"auth/login", {
        email: this.email,
        password: this.password
      }, {withCredentials:true})
      .then(res=>{
        console.log(res.data)
        this.$router.push({name: "Creds"})
      })
      .catch(({response}) => {
        console.log(response.data);
      })
    },

    startOtc() {
      axios.post(this.$store.state.api_url+"auth/login/otc/new", {
        userId: this.previousUser._id
      }, {withCredentials:true})
      .then(res=>{
        console.log(res.data)
        this.setMode("otc");
      })
      .catch(({response}) => {
        console.log(response.data);
      })
    },

    attemptOtc(code) {
      console.log(code)
      axios.post(this.$store.state.api_url+"auth/login/otc/attempt", {
        userId: this.previousUser._id,
        code
      }, {withCredentials:true})
      .then(res=>{
        console.log(res.data)
        this.$router.push('/app')
      })
      .catch(({response}) => {
        console.log(response.data);
      })
    }
  }
}
</script>
