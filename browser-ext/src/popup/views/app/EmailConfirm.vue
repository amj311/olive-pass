<template>
  <div id="emailConfirmPage">
    <h1>Confirm Your Email</h1>
    <div v-if="loading"><Spinner /></div>
    <div v-else id="pageContent">
      <div v-if="existingConfirm">
        <p>A confirmation code has been sent to {{existingConfirm.email}}.</p>
        <p><a @click="startConfirm(existingConfirm.email)">Send a new code.</a></p>
        <form @submit.prevent="attemptConfirm" id="codeDigitForm">
          <div id="codeDigitsRow">
            <div v-for="digit in codeDigits" :key="digit.idx" class="code-digit-box">
              <input v-model="digit.val" @input="onCodeDigitInput(digit)" @click="onCodeDigitClick" type="text"
                class="code-digit-input" />
            </div>
          </div>
          <button type="submit">Confirm</button>
        </form>
      </div>

      <div v-else>
        <h1>Link Your Email</h1>
        <form @submit.prevent="startConfirm(newEmail)">
          <input type="email" v-model="newEmail" />
          <button type="submit">Next</button>
        </form>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios'
import Spinner from '../../components/Spinner.vue';
import Constants from '../../../../../model/Constants'

export default {
components: { Spinner },
name: "CredRow",
data() { return {
  loading: true,
  existingConfirm: null,
  newEmail: "",
}},

beforeMount() {
  this.getExistingConfirm();
},

mounted() {
},

methods: {
  openAttemptForm() {
    document.querySelector(".code-digit-input")?.focus();
  },

  getExistingConfirm() {
    this.loading = true;
    axios.get(this.$store.state.api_url+"account/confirm-email", {withCredentials:true})
    .then(res=>{
      if (res.data?.email) {
        this.existingConfirm = res.data;
        this.$nextTick(()=>this.openAttemptForm());
      }
    })
    .catch(err=>{
      console.log(err);
      this.existingConfirm = null;
    })
    .finally(()=>{
      this.loading = false;
    })
  },

  startConfirm(email) {
    this.loading = true;
    axios.post(this.$store.state.api_url+"account/start-confirm-email", {email}, {withCredentials:true})
    .then(res=>{
      if (res.data?.email) {
        this.existingConfirm = res.data;
        this.$nextTick(()=>this.openAttemptForm());
      }
    })
    .catch(err=>{
      console.log(err);
      this.existingConfirm = null;
    })
    .finally(()=>{
      this.loading = false;
    })
  },

  attemptConfirm() {
    if (!this.isValidCode) return;
    this.loading = true;
    axios.post(this.$store.state.api_url+"account/attempt-confirm-email", {code: this.codeString}, {withCredentials:true})
    .then(res=>{
      if (res.data?.isEmailConfirmed) this.$router.push("/app");
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.loading = false;
    })
  },

  onCodeDigitClick(event) {
    event.target.select()
  },

  onCodeDigitInput(digit) {
    let inputs = document.querySelectorAll(".code-digit-input");
    if (digit.val.length === 1) {
      let nextIdx = digit.idx+1;
      if (nextIdx < inputs.length) {
        let nextInput = inputs[nextIdx];
        nextInput.focus();
        nextInput.select();
      }
    }
    if (digit.val.length > 1) {
      let remainingChars = [...digit.val];
      let idx = digit.idx;
      let input;
      while (idx < inputs.length) {
        input = inputs[idx];
        input.value = remainingChars.splice(0,1);
        idx++;
      }
      input.focus();
    }
  }
},

  computed: {
    codeDigits() {
      let digits = [];
      for (let i = 0; i < Constants.EmailCodeLength; i++) {
        digits.push({val:"",idx:i});
      }
      return digits;
    },
    codeString() {
      return this.codeDigits.map(d=>d.val).join("");
    },
    
    isValidCode() {
      return this.codeString.length === Constants.EmailCodeLength;
    }
  }
}
</script>

<style scoped>
#emailConfirmPage {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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

a {
  color: #fff;
  text-decoration: underline;
  cursor: pointer;
}

div#codeDigitsRow {
  display: flex;
  justify-content: center;
}

.code-digit-box {
  margin: .5em;
}

input.code-digit-input {
  width: 1.5em;
  font-size: 1.2em;
  text-align: center;
}
</style>