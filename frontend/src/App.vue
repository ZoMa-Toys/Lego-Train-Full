<template>
  <div id="app">
    <div id="nav">
      <router-link v-if="authenticated" to="/" v-on:click="logout()" replace>Logout</router-link>
    </div>
    <router-view @authenticated="setAuthenticated"/>
  <div>
    <a style="background-color: white">Version: {{ currentVersion }}</a>
  </div>
  </div>
</template>

<style>
#app {
  max-width: 900px;
  min-width: 315px;
  margin: auto;
  margin-top: 5%;
}
</style>

<script>
  export default {
    name: 'App',
    data() {
      return {
        currentVersion: process.env.VUE_APP_VERSION,
        authenticated: false,
      }
    },
    mounted() {
      if(!this.authenticated) {
        this.$router.replace({ name: "login" }).catch(err => {console.log(err)});
      }
      if(!this.currentVersion){
        this.currentVersion = "devVersion"
      }
    },
    methods: {
      setAuthenticated(status) {
        this.authenticated = status;
      },
      logout() {
        this.authenticated = false;
      }
    }
  }
</script>