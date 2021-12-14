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
                 apihost: process.env.VUE_APP_APIHOST,
            }
        },
        methods: {
            login() {
                if (process.env.VUE_APP_AUTO_LOGIN === 'True'){
                    this.$emit("authenticated", true);
                    this.$router.replace({ name: "swtichControl" });
                }
                else if((this.input.username != "" && this.input.password != "")) {
                    if (this.input.username === "Familymember" & this.input.password === "WE4RTsdf!"){
                        this.$emit("authenticated", true);
                        this.$router.replace({ name: "swtichControl" });
                    } else {
                        this.message = "The username and / or password is incorrect";
                        console.log("The username and / or password is incorrect");
                    }
                } else {
                    this.message = "A username and password must be present";
                    console.log("A username and password must be present");
                }
            }
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