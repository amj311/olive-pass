<template>
  <div id="app">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css">
    
    <router-view v-if="!loading" />
    <div v-else class="app-loading">
      <Spinner />
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import Spinner from '../components/Spinner.vue';

export default {
  name: 'Home',
  components: {
    Spinner
  },
  data() { return {
    loading: false,
  }},

  beforeMount() {
    this.loading = true;
    axios.get(this.$store.state.api_url+"check-auth", {withCredentials:true})
      .then(res=>{
        console.log("Is authenticated!", res.data)
        this.$store.commit('userData',res.data);
        this.$nextTick(()=>this.$router.push("app"));
      })
      .catch(err=>{
        if (err.response?.status === 401) {
          console.warn("You are not logged in - rerouting to home.")
          this.$router.push('/');
        }
        else console.log(err)
      })
      .finally(()=>{
        this.loading = false;
      })
  },
  methods: {
    setMode(mode) {
      this.mode = mode;
    }
  },
}
</script>

<style lang="scss">
:root {
  --primary: rgb(100, 212, 28);
}

body {
  margin: 0;
  background-color: var(--primary);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 350px;
  height: 400px;
  overflow: auto;
}

a {
  color: var(--primary);
}


input[type="text"], input[type="email"], input[type="password"], input[type="search"] {
  width: 100%;
  margin: .2em 0;
  font-size: 1.1em;
  padding: .2em;
  box-sizing: border-box;
  
  :active {
    border: 2px solid var(--primary);
  }
}

.app-loading {
  color: #fff;
  text-align: center;
  margin: 1em;
  font-size: 2em;
}
</style>
