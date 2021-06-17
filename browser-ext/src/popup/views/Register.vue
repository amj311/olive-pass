<template>
  <div>
    <input v-model="firstname" placeholder="First Name" type="text" />
    <input v-model="lastname" placeholder="Last name" type="text" />
    <input v-model="email" placeholder="Email" type="email" />
    <input v-model="password" placeholder="Password" type="password" />
    <br>
    <button @click.prevent="register">Register</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Register',
  data() { return {
    email: "",
    password: "",
    firstname: "",
    lastname: ""
  }},
  methods: {
    register() {
      let {email, password, firstname, lastname} = this;
      axios.post(this.$store.state.api_url+"auth/register", {
        email, password, firstname, lastname
      }, {withCredentials:true})
      .then(res=>{
        axios.post(this.$store.state.api_url+"auth/login", {
        email, password,
      }, {withCredentials:true})
        .then(res=>{
          console.log(res.data)
          this.$router.push({name: "Creds"})
        })
      })
      .catch(({response}) => {
        console.log(response.data);
      })
    }
  }
}
</script>
