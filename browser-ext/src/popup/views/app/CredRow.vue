<template>
  <div>

    <div class="credRow">
      <div class="cred-cell nickname" ><b>{{cred.nickname}}</b></div>
      <div class="cred-cell account" >{{cred.accountIdentifier}}</div>
      <div class="cred-cell password" >{{cred.password || "••••••"}}</div>
      <div class="cred-cell toggle">
        <Spinner v-if="loadingPass" :size="'.8em'" />
        <i v-else @click="togglePassword()" :class="`fa fa-eye${cred.password===''?'':'-slash'}`"></i>
      </div>
      <div class="cred-cell toggle" @click="deleteCred()">
        <i class="fa fa-trash"></i>
      </div>      
    </div>
  </div>
</template>


<script>
import axios from 'axios'
import Spinner from '../../../components/Spinner.vue';

export default {
components: { Spinner },
name: "CredRow",
props: ["cred"],
data() { return {
  loadingPass: false,
}},

beforeMount() {
},

mounted() {
},

methods: {
  
  togglePassword() {
    if (this.cred.password !== "") {
      this.cred.password = ""
      return;
    }
    this.loadingPass = true;
    axios.get(this.$store.state.api_url+"creds/p/"+this.cred._id, {withCredentials:true})
    .then(res=>{
      this.cred.password = res.data;
    })
    .catch(({response}) => {
      console.log(response.data);
    })
    .finally(()=>{
      this.loadingPass = false;
    })
  },

  deleteCred() {
    this.$emit("delete", this.cred);
  },

  truncateUrl(url) {
    let trunc = url;
    if (trunc.startsWith("http")) trunc = trunc.split("//")[1];
    if (trunc.includes("/")) trunc = trunc.split("/")[0];
    if (trunc.startsWith("www.")) trunc = trunc.split("www.")[1];
    return trunc;
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

  computed: {
  }
}
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

input#filterField {
    font-size: 1.25em;
    width: 100%;
    padding: .25rem;
    box-sizing: border-box;
}

.domainCredsList summary {
  padding: .5em;
  font-weight: bold;
  background: #0001;
}

.credRow {
  display: grid;
  grid-template-columns: 1fr 1fr 5em 2em 2em;
  border-bottom: 1px solid #0002;
}
.credRow:hover {
  background: #00000007;
}

.credRow .cred-cell {
  display:flex;
  place-items: center;
  padding: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cred-cell.url {
  direction: rtl;
  display: flex;
  justify-content: flex-end;
}
.url-rtl {
  overflow: inherit;
  text-overflow: inherit;
}
</style>