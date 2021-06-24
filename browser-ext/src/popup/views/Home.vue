<template>
  <div id="homePage">
    <div id="formWrapper">
      <div>
        <h1><i>OlivePass</i></h1>
        <p>Simply safe, by SimplyOlive Apps.</p>
      </div>

      <div v-if="!loading">
        <div v-if="mode === 'login'">
          <Login />
          <p><a href="#" @click="setMode('register')">Create an account →</a></p>
        </div>
        <div v-if="mode === 'register'">
          <Register />
          <p><a href="#" @click="setMode('login')">Log in to your account →</a></p>
        </div>
      </div>

      <div v-else>
        <p></p>
        <Spinner :size="'2em'" />
        <p>Loading...</p>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import Login from './Login';
import Register from './Register';
import Spinner from '../components/Spinner.vue';

export default {
  name: 'Home',
  components: {
    Login,
    Register,
    Spinner
  },
  data() { return {
    mode: "login",
    loading: false,
  }},

  methods: {
    setMode(mode) {
      this.mode = mode;
    }
  },
}
</script>

<style scoped>
#homePage {
  display: flex;
  width:100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  background-color: var(--primary);
  background-image: radial-gradient(transparent, 70%, #fff7);
  color: #fff;
  text-align: center;
  padding: 1rem;
}

#formWrapper {
  margin: auto;
  max-width: 13rem;
}

#homePage a {
  color: #fff;
}
</style>