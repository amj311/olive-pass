<template>
  <div class="home">
    <input v-model="email" placeholder="Email" type="email" />
    <input v-model="password" placeholder="Password" type="password" />
    <button @click.prevent="login" >Login</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  data() { return {
    email: "",
    password: ""
  }},
  methods: {
    login() {
      axios.post(this.$store.state.api_url+"login", {
        email: this.email,
        password: this.password
      }, {withCredentials:true})
      .then(res=>{
        console.log(res.data)
        this.$router.push({name: "Dashboard"})
      })
      .catch(({response}) => {
        console.log(response.data);
    })
    }
  }
}
</script>
