<template>
  <div id="app">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css">
    <router-view/>
  </div>
</template>

<style lang="scss">
:root {
  --primary: rgb(100, 212, 28);
}

body {
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 350px;
  height: 400px;
  overflow: auto;
}

a {
  color: var(--primary);
}
</style>
