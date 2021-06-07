<template>
  <div>

    <input type="search" id="filterField" v-model="filterQuery" placeholder="Filter" />

    <p v-show="loadingCreds" style="text-align: center">
      <Spinner :size="'2em'" :color="'var(--primary)'" />
    </p>
    <div v-for="domain in credsByDomain" :key="domain.host">
      <details class="domainCredsList" open>
        <summary>{{domain.host}}</summary>

          <!-- eslint-disable-next-line -->
          <div v-for="cred in domain.creds" :key="cred._id" class="credRow">
            <div class="cred-cell nickname" ><b>{{cred.nickname}}</b></div>
            <div class="cred-cell account" >{{cred.accountIdentifier}}</div>
            <div class="cred-cell password" >{{cred.password || "••••••"}}</div>
            <div class="cred-cell toggle" @click="togglePassword(cred)">
              <i :class="`fa fa-eye${cred.password===''?'':'-slash'}`"></i>
            </div>
            <div class="cred-cell toggle" @click="deleteCred(cred)">
              <i class="fa fa-trash"></i>
            </div>
              
        </div>
      </details>
    </div>

    <div v-if="credsByDomain.length === 0 && !loadingCreds" style="text-align:center">
      <p v-if="creds.length === 0">You haven't saved any credentials yet.</p>
      <p v-else-if="filterQuery">No matches. <a href="#" @click="filterQuery = ''">Clear filter?</a></p>
      <p v-else>Couldn't load credentials.</p>
    </div>
  </div>
</template>


<script>
import axios from 'axios'
import Spinner from '../../../components/Spinner.vue';

export default {
components: { Spinner },
name: "Dashboard",
data() { return {
  loadingCreds: false,
  creds: [],
  filterQuery: "",
}},

beforeMount() {
  this.getCreds();
},

mounted() {
},

methods: {
  
  getCreds() {
    this.loadingCreds = true;
    axios.get(this.$store.state.api_url+"creds/all", {withCredentials:true})
    .then(res=>{
      console.log(res.data)
      this.creds = res.data;
    })
    .catch(({response}) => {
      console.log(response.data);
    })
    .finally(()=>{
      this.loadingCreds = false;
    })
  },

  togglePassword(cred) {
    if (cred.password !== "") {
      cred.password = ""
      return;
    }
    console.log(cred._id)
    axios.get(this.$store.state.api_url+"creds/p/"+cred._id, {withCredentials:true})
    .then(res=>{
      console.log(res.data)
      cred.password = res.data;
    })
    .catch(({response}) => {
      console.log(response.data);
    })
  },

  deleteCred(cred) {
    let confirmStr = `Are you sure you want to delete these credentials?\n
      Nickname: ${cred.nickname}
      Domain: ${this.truncateUrl(cred.url)}
      Account: ${cred.accountIdentifier}`;
    if (!confirm(confirmStr)) return;

    axios.delete(this.$store.state.api_url+"creds/"+cred._id, {withCredentials:true})
      .then(res=>{
        console.log(res.data)
        this.creds = this.creds.filter(c => c._id != cred._id);
      })
      .catch(({response}) => {
        console.log(response.data);
      })
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
    filteredCreds() {
      if (!this.filterQuery) return this.creds;
      let query = this.filterQuery;
      function hasQuery(str1) {
        return str1.toLowerCase().includes(query.toLowerCase());
      }
      let filter = this.creds.filter(c => {
        console.log(c)
        return hasQuery(c.accountIdentifier) ||
          hasQuery(c.url) ||
          hasQuery(c.nickname);
      });
      console.log({filter})
      return filter;
    },

    credsByDomain() {
      let domains = new Map(); //<domain, creds[]>
      this.filteredCreds.forEach(c => {
                console.log(c)

        let domain = this.truncateUrl(c.url);
        if (domains.has(domain)) {
          domains.get(domain).push(c);
        }
        else domains.set(domain,[c]);
      });
      return Array.from(domains.keys()).map(d => {return {host:d,creds:domains.get(d)}})
    }
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