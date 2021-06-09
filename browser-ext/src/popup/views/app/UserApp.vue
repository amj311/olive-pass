<template>
  <div id="appWrapper">
    <div id="appHeader">
      <b class="header-item">OlivePass</b>

      <div id="topMenu">
        <router-link :to="{name: 'Creds'}"><div class="header-item nav-link"><i class="fa fa-key"></i></div></router-link>
        <div class="header-item nav-link"><i class="fa fa-plus"></i></div>
        <div class="header-item nav-link"><i class="fa fa-cog"></i></div>
        <div class="header-item nav-link" @click="logout"><i class="fa fa-sign-out-alt"></i></div>
      </div>
    </div>
    <div id="appBody">
      <!-- <div id="appMenu" v-show="showMenu">
        <div id="upperMenu">
          <i class="fa fa-key"></i>
        </div>
        <div id="lowerMenu">
          <i class="fa fa-cog"></i>
          <i class="fa fa-sign-out-alt"></i>
        </div>
      </div> -->
      <div id="pageContent">
        <router-view />
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios'

export default {
name: "UserApp",
data() { return {
  showMenu: false
}},

beforeMount() {
  axios.get(this.$store.state.api_url, {withCredentials:true})
    .then(res=>{
    })
    .catch(err=>{
      if (err.response?.status === 401) {
        console.warn("You are not logged in - rerouting to home.")
        this.$router.push('/');
      }
      else console.log(err)
    })
},

mounted() {
},

methods: {
  toggleMenu() {
    this.showMenu = !this.showMenu;
  },

  logout() {
    if (!confirm("Are your sure you want to log out of OlivePass?")) return;
    axios.post(this.$store.state.api_url+"logout")
      .then(res=>{
        chrome.cookies.remove({url:this.$store.state.api_url,name:"op-session"});
        this.$router.push("/");
      })
      .catch(err=>{
        console.log(err);
      })
  }
}
}
</script>

<style scoped lang="scss">
#appWrapper {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

#appHeader {
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2rem;
}

.header-item {
  padding: .5em;
}

#topMenu {
  display: flex;
}
.nav-link {
  color: white;
  cursor: pointer;

  a {
    color: white;
  }

  i[class*=" fa-"] {
    transform: scale(.9);
  }

  &:hover {
    background: #0001;
  }
}
.router-link-active {
  background: #0001;
  pointer-events: none;
}

#appBody {
  position: relative;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

#appMenu {
  background: #0001;
  font-size: 1.5rem;
  color: #0003;
  padding: .5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  width: min-content;
}

div#pageContent {
  flex-grow: 1;
}
</style>