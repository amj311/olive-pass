<template>
  <div id="app">
    <div id="nav">
      Welcome to the app!
    </div>
    <router-view />

    <table cellpadding="10">
      <tbody>
        <tr>
          <th>Website</th>
          <th>Nickname</th>
          <th>Username</th>
          <th>Password</th>
          <th></th>
        </tr>
  
        <tr v-for="cred in creds" :key="cred.nickname">
          <td>{{cred.domain}}</td>
          <td><b>{{cred.nickname}}</b></td>
          <td>{{cred.accountIdentifier}}</td>
          <td>{{cred.password || "*****"}}</td>
          
        </tr>

      </tbody>
    </table>
  </div>
</template>


<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import axios from 'axios'

@Component
export default class UserApp extends Vue {
  creds = [];

  mounted() {
    this.getCreds();
  }

  getCreds() {
    axios.get("http://localhost:3000/api/creds/all", {withCredentials:true})
    .then(res=>{
      console.log(res.data)
      this.creds = res.data;
    })
    .catch(({response}) => {
      console.log(response.data);
    })
  }
}
</script>