<template>
   <div id="homePage">
    <div class="home">
      <h1><i>OlivePass</i></h1>
      <p>Simply safe, by SimplyOlive Apps.</p>
    </div>

    <div v-if="mode === 'login'">
      <Login />
      <p><a href="#" @click="setMode('register')">Create an account →</a></p>
    </div>
    <div v-if="mode === 'register'">
      <Register />
      <p><a href="#" @click="setMode('login')">Log in to your account →</a></p>
    </div>
   </div>
</template>

<script>
import axios from 'axios';
import Login from './Login';
import Register from './Register';

export default {
  name: 'Home',
  components: {
    Login,
    Register
  },
  data() { return {
    mode: "login"
  }},

  beforeMount() {
    axios.get("http://localhost:3000/api/", {withCredentials:true})
      .then(res=>{
        this.$router.push("app");
      })
      .catch(err=>{
      })
  },
  methods: {
    setMode(mode) {
      this.mode = mode;
    }
  },
}
</script>

<style scoped>
#homePage {
  background-color: var(--primary);
  background-image: radial-gradient(transparent, 70%, #fff7);
  color: #fff;
  text-align: center;
  padding: 1rem;
}

#homePage a {
  color: #fff;
}
</style>