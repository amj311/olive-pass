<template>
  <div :style="{fontSize: displaySize, color: displayColor}" class="op-loading-spinner"></div>
</template>

<script>

export default {
  name: 'Spinner',
  props: ["size", "color"],
  computed: {
    displaySize () {
      return this.size || "1em";
    },
    
    displayColor () {
      return this.color || "inherit";
    }
  }
}
</script>

<style scoped>
.op-loading-spinner {
  display: inline-block;
  border: .2em solid;
  border-top-color: transparent;
  width: 1em;
  min-width: 1em;
  max-width: 1em;
  height: 1em;
  min-height: 1em;
  max-height: 1em;
  border-radius: 50%;
  animation: spin 2s infinite linear;
}
@keyframes spin {
  from {
      transform:rotate(0deg);
  }
  to {
      transform:rotate(360deg);
  }
}
</style>
