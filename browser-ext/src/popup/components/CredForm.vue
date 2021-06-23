<template>
  <div>
    <h1 id="formHeader">{{mode}} Credential</h1>

    <p v-if="loading" style="text-align: center">
      <Spinner :size="'2em'" :color="'var(--primary)'" />
    </p>

    <div v-else id="credForm">
      <div class="form-section-header">General</div>
      <div class="form-input-row">
        <label>Nickname</label>
        <input type="text" v-model="cred.nickname" placeholder="Nickname" />
      </div>
      <div class="form-input-row">
        <label>Site URL</label>
        <input type="text" v-model="cred.url" placeholder="Site URL" />
      </div>

      <div class="form-section-header">Login Info</div>
      <div class="form-input-row">
        <label>Account</label>
        <input type="text" v-model="cred.accountIdentifier" placeholder="Account" />
      </div>
      <div class="form-input-row">
        <label>Password</label>
        <input type="text" v-model="cred.password" placeholder="Password" />
      </div>
      <br>
      <div id="buttonRow">
        <button @click="submit">Save</button>
        <button @click="cancel">Cancel</button>
        <button v-if="mode === 'edit'" @click="deleteCred">Delete</button>
      </div>
    </div>

  </div>
</template>


<script>
import axios from 'axios'
import Spinner from './Spinner.vue';

export default {
components: { Spinner },
props: ["cred", "mode", 'loading'],
name: "CredForm",

data() { return {
}},

beforeMount() {
},

mounted() {
},

methods: {
  deleteCred() {
    let confirmStr = `Are you sure you want to delete these credentials?`;
    if (!confirm(confirmStr)) return;

    axios.delete(this.$store.state.api_url+"creds/"+this.cred._id, {withCredentials:true})
      .then(res=>{
        this.$router.push({name:"Creds"});
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
  },

  submit() {
    this.$emit("submit", this.cred);
  },

  cancel() {
    this.$emit("cancel", this.cred);
  }

},

  computed: {}
    
}
</script>

<style scoped>
#formHeader {
  text-transform: capitalize;
}

.form-input-row {
  display: flex;
  align-items: center;
}

.form-input-row label {
  width: 7em;
}

.form-section-header {
  margin: 1em 0 .5em;
  font-weight: bold;
  font-size: 1.2em;
}
</style>