<template>
  <div id="app">
    <router-view />

    <div id="credGrid">
        <!-- eslint-disable-next-line -->
      <template v-for="cred in creds" :key="">
          <div class="cred-cell domain" :key="cred._id+'domain'">
              {{truncateUrl(cred.domain)}}
          </div>
          <div class="cred-cell nickname" :key="cred._id+'nickname'"><b>{{cred.nickname}}</b></div>
          <div class="cred-cell account"  :key="cred._id+'account'">{{cred.accountIdentifier}}</div>
          <div class="cred-cell password"  :key="cred._id+'pwd'">{{cred.password || "*****"}}</div>
          <div class="cred-cell toggle"  :key="cred._id+'toggle'"><button @click="togglePassword(cred)">
            {{cred.password===""?"Show":"Hide"}}
          </button></div>
          
      </template>
    </div>
  </div>
</template>


<script lang="ts">
import Vue from 'vue'
import axios from 'axios'

export default Vue.extend({
name: "UserApp",
data() {
    let ctx = this;
    return new class {
        creds = [];
        columnDefs = [];
        rowData = [];
        gridApi = null;

}},

beforeMount() {
  this.getCreds();
},

mounted() {
},

methods: {
  
  getCreds() {
    axios.get("http://localhost:3000/api/creds/all", {withCredentials:true})
    .then(res=>{
      console.log(res.data)
      this.creds = res.data;
    })
    .catch(({response}) => {
      console.log(response.data);
    })
  },

  togglePassword(cred) {
    if (cred.password !== "") {
      cred.password = ""
      return;
    }
    console.log(cred._id)
    axios.get("http://localhost:3000/api/creds/p/"+cred._id, {withCredentials:true})
    .then(res=>{
      console.log(res.data)
      cred.password = res.data;
    })
    .catch(({response}) => {
      console.log(response.data);
    })
  },

  truncateUrl(url) {
  }

},
// Savefor later!

// str2Url(string) {
//   let url = encodeURI(string)
//   return url
//       .replaceAll("#", "%23",)
//       .replaceAll("&", "%26")
// }

// faviBgStyle(url) {
//   return {
//     backgroundImage: `-webkit-image-set(url(chrome://favicon2/?size=16&scale_factor=1x&page_url=${this.str2Url(url)}) 1x)`
//   }
// }
})
</script>

<style scoped>
th {
  text-align: left !important;
}
.favi {
  height: 16px;
  width: 16px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
#credGrid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-top: 1px solid;
  border-right: 1px solid;
}

#credGrid .cred-cell {
  padding: 5px;
  border-left: 1px solid;
  border-bottom: 1px solid;
}
</style>