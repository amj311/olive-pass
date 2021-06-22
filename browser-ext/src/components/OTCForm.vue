<template>
  <form @submit.prevent="submit" id="codeDigitForm">
    <div id="codeDigitsRow">
      <div v-for="digit in codeDigits" :key="digit.idx" class="code-digit-box">
        <input v-model="digit.val" @input="onCodeDigitInput(digit)" @click="onCodeDigitClick" type="text"
          class="code-digit-input" />
      </div>
    </div>
    <button type="submit">{{buttonText}}</button>
  </form>
</template>

<script>

export default {
  name: 'OTCForm',
  props: ["length", "buttonText", 'validator'],
  methods: {
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
    },

    submit() {
      this.$emit("submit", this.codeString);
    }
  },

  computed: {
    codeDigits() {
      let digits = [];
      for (let i = 0; i < this.length; i++) {
        digits.push({val:"",idx:i});
      }
      return digits;
    },

    codeString() {
      return this.codeDigits.map(d=>d.val).join("");
    },
    
    isValidCode() {
      if (this.validator){
        if (!this.validator(this.codeString)) return false;
      }
      return this.codeString.length === this.length;
    }
  }
}
</script>

<style scoped>
div#codeDigitsRow {
  display: flex;
  justify-content: center;
}

.code-digit-box {
  margin: .25em;
}

input.code-digit-input {
  width: 1.5em;
  height: 2em;
  font-size: 1.2em;
  text-align: center;
}
</style>
