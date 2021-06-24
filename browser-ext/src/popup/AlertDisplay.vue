<template>
  <div id="alertsDisplay">
    <div class="alert-wrapper" v-for="alert,i in alerts" :key="i">
      <div class="alert-message">{{alert.message}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlertDisplay',
  data() { return {
    alertManager: this.$store.state.alertManager,
  }},
  beforeMount(){
  },
  methods: {
  },
  computed: {
    alerts() {
      return this.alertManager.alerts;
    }
  }
}
</script>

<style scoped>
#alertsDisplay {
  position: fixed;
  bottom: .5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.alert-wrapper {
  position: relative;
  bottom: 0;
  background: #0008;
  color: #fff;
  border-radius: .5em;
  padding: .5em;
  margin: .25em;
  font-size: 1.2em;
}
</style>