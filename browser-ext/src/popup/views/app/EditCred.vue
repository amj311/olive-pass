<template>
  <div>
    <CredForm :cred="cred" :loading="loading" :mode="'edit'" @submit="submit" @cancel="cancel" />
  </div>
</template>


<script>
import axios from 'axios'
import CredForm from '../../components/CredForm.vue';

export default {
components: { CredForm },
props: ["credId"],
name: "EditCred",
data() { return {
  loading: false,
  cred: null,
}},

beforeMount() {
  this.getCred();
},

mounted() {
},

methods: {
  async getCred() {
    this.loading = true;
    axios.get(this.$store.state.api_url+"creds/"+this.credId, {withCredentials:true})
    .then(async res=>{
      let cred = res.data;
      let pass = await axios.get(this.$store.state.api_url+"creds/p/"+cred._id, {withCredentials:true}).then(res=>{
        return res.data;
      });
      cred.password = pass;
      this.cred = cred;
    })
    .catch(({response}) => {
      console.log(response.data);
    })
    .finally(()=>{
      this.loading = false;
    })
  },

  submit() {
    this.loading = true;
    axios.put(this.$store.state.api_url+"creds/update", this.cred, {withCredentials:true})
    .then(res=>{
      this.$store.state.alertManager.addAlert({message:"Saved!"});
    })
    .catch(err=>console.log(err))
    .finally(this.loading = false);
  },

  cancel() {
    this.$router.go(-1);
  }
},

  computed: {}
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
.domainCredsList:not([open]) summary {
    border-bottom: 1px solid #0002;
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