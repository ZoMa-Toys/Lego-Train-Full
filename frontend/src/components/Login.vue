<template>
    <div class="shadow-lg p-3 mb-5 rounded" id="login">
        <h1>Login</h1>
        <b-form @submit.prevent="login" class="w-100">
            <b-form-input type="text" name="username" v-model="input.username" placeholder="Username" />
            <b-form-input type="password" name="password" v-model="input.password" placeholder="Password" />
            <b-button type="submit" variant="primary">Login</b-button>
        </b-form>
        <div style="color: red" >{{ message }}</div >
    </div>
</template>

<script>
function setWs(apihost,dataModFunction){
  const connection = new WebSocket(apihost);

  connection.onmessage = ({data}) => {
    dataModFunction(JSON.parse(data));
  }

  connection.onopen = function() {
    console.log("Successfully connected to the echo websocket server...");
  }
  return connection
}

    // import axios from 'axios';
    export default {
        name: 'Login',
        data() {
            return {
                input: {
                    username: "",
                    password: ""
                },
                message: "",
                apihost: "ws://" + location.hostname +":" + (process.env.VUE_APP_PORT==8080?process.env.VUE_APP_PORT:location.port) +"/ws",
            }
        },
        created: function() {
        //this.connection=setWs(this.apihost,this.updateSwitch,null);
            this.connection=setWs(this.apihost,this.getResult);
        },
        methods: {
            getResult(data){
                if ("authentication" in data){
                    if(data.authentication == "succeeded"){
                        this.$emit("authenticated", true);
                        this.$router.replace({ name: "swtichControl", params: {username: data.user} });
                        /* this.$router.replace({ name: "swtichControl" }); */
                    } else if(data.authentication == "userNotFound"){
                        this.message = "The username not found";
                    } else {
                        this.message = "The username or password is incorrect";
                    }
                }
            },
            login() {
                this.connectWs()
                if(this.input.username != "" && this.input.password != "") {
                    let payload = JSON.stringify({login:{user: this.input.username,password: this.input.password}})
                    this.connection.send(payload)
                } else {
                    this.message = "A username and password must be present";
                }
            },
            connectWs(){ 
                if (this.connection.readyState != this.connection.OPEN ){
                    this.connection=setWs(this.apihost,this.getResult);
                }
            },
        }
    }
</script>

<style scoped>
    #login {
        width: 500px;
        border: 1px solid #CCCCCC;
        background-color: #FFFFFF;
        margin: auto;
        margin-top: 200px;
        padding: 20px;
    }
</style>