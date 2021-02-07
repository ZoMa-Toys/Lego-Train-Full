<template>
  <div
    id="train"
    class="shadow-lg p-3 mb-5 rounded"
    style="background-color: #f1f1f1"
  >
    
    <table>
      <tr>
        <td style="vertical-align: top">
          <tr>
            <td colspan="2">
              <div class="row">
                <number-input
                  :min="0"
                  :max="switches.length"
                  controls
                  v-model="switchid"
                ></number-input>
                <b-form-select v-model="newtype" class="col-sm-3">
                  <option v-for="(type, index) in types" :key="index">
                    {{ index }}
                  </option>
                </b-form-select>
                <b-form-input type="color" class="col-sm-3" v-model="color"></b-form-input>
                <!-- <b-form-select v-model="color" class="col-sm-3">
                  <option v-for="(c, index) in colors" :key="index" :style="c" :value="c">
                    {{ index }}
                  </option>
                </b-form-select> -->
              </div>
              <div class="row">
                <b-form-select v-model="rotation" class="col-sm-3">
                  <option value="">Normal</option>
                  <option value="rotate(90deg)">rotate right</option>
                  <option value="rotate(180deg)">flip</option>
                  <option value="rotate(270deg)">rotate left</option>
                </b-form-select>
                <b-form-select v-model="printed" class="col-sm-3">
                  <option v-for="(item, key, index) in printed_list" :key="index">
                    {{ key }}
                  </option>
                </b-form-select>
              </div>
              <div class="row">
                <b-button @click="insertOne" variant="success">InsertOne</b-button>
                <b-button @click="deleteAll" variant="danger">DeleteAll</b-button>
                <b-button @click="setDefault" variant="outline-primary">SetDefault</b-button>
              </div>
            </td>
          </tr>
          <tr  v-for="index in mod2(switches)" :key="index" >
            <switchrow
              :switches="switches"
              :index="index"
              :SwitchTrack="SwitchTrack"
              :deleteOne="deleteOne"
            />
            <switchrow
              :switches="switches"
              :index="index + 1"
              :SwitchTrack="SwitchTrack"
              :deleteOne="deleteOne"
            />
          </tr>
          <tr>
            <td colspan="2">
              <b-form-textarea id="textarea" v-model="switches_str"></b-form-textarea>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <b-button @click="sendAction('setConfig')" variant="outline-primary">SendConfig</b-button>      
              <b-button @click="sendAction('getConfig')" variant="outline-primary">GetConfig</b-button>
            </td>
          </tr>
        </td>
        <td style="vertical-align: top">
          <tr>
            <td colspan="2">
              <div class="row">
                <b-button @click="connectWs()" variant="success">ReconnectWs</b-button>
                <b-button @click="sendAction('scan')" variant="outline-primary">startScan</b-button>
                <b-button @click="sendAction('stop')" variant="danger">stopScan</b-button>
                <b-button @click="getHubs" variant="primary">getHubs</b-button>
                <b-button @click="sendAction('disconnectHubs')" variant="danger">disconnectAllHub</b-button>
              </div>
            </td>
          </tr>
          <tr  v-for="train in trains" :key="train.NAME" >
            <controller
              :train="train"
              :hubs="hubs"
              :Colors="Colors"
              :setPower="setPower">
            </controller>
          </tr>
        </td>
      </tr>

      <tr></tr>
      <tr v-show="switches.length == 0">
        <td>No switch added</td>
      </tr>
    </table>
    
  </div>
</template>

<script>
// import axios from "axios";
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
function setWs(apihost,dataModFunction){
  // console.log("Starting connection to WebSocket Server")
  const connection = new WebSocket(apihost);

  connection.onmessage = ({data}) => {
    dataModFunction(JSON.parse(data));
    console.log(data);
    // var j_data = JSON.parse(data);
    // switches[j_data.motor].switched = getKeyByValue(switches[j_data.motor].pulse,j_data.pulse);
  }

  
  connection.onopen = function() {
    // console.log(event)
    console.log("Successfully connected to the echo websocket server...")
  }
  return connection
}
function getInitialData() {
  return {
    connection: null,
    connection2: null,
    newtype: "left",
    color: "#4CAF50",
    rotation: "",
    new_pulse_true: 240,
    new_pulse_false: 420,
    change_id: 0,
    printed_list: {
      Original: false,
      Printed: true,
    },
    printed: "Original",
    types: {
      left: {
        Original: { Straight: 240, Turn: 420 },
        Printed: { Straight: 280, Turn: 380 },
      },
      right: {
        Original: { Straight: 420, Turn: 240 },
        Printed: { Straight: 380, Turn: 280 },
      },
    },
    colors: {
      green: { backgroundColor: "#4CAF50" },
      blue: { backgroundColor: "#008CBA" },
      yellow: { backgroundColor: "#FFBF00" },
      red: { backgroundColor: "#f44336" },
      white: { backgroundColor: "#e7e7e7" },
    },
    switches: [
      {
        type: "left",
        pulse: { Straight: 240, Turn: 420 },
        switched: "Straight",
        printed: "Original",
        img_style: {
          backgroundColor: "#4CAF50",
          transform: "rotate(0deg)",
          maxWidth: "100%",
          height: "auto",
        },
      },
      {
        type: "right",
        pulse: { Straight: 420, Turn: 240 },
        switched: "Straight",
        printed: "Original",
        img_style: {
          backgroundColor: "#008CBA",
          transform: "rotate(0deg)",
          maxWidth: "100%",
          height: "auto",
        },
      },
      {
        type: "left",
        pulse: { Straight: 240, Turn: 420 },
        switched: "Straight",
        printed: "Original",
        img_style: {
          backgroundColor: "#f44336",
          transform: "rotate(0deg)",
          maxWidth: "100%",
          height: "auto",
        },
      },
      {
        type: "right",
        pulse: { Straight: 420, Turn: 240 },
        switched: "Straight",
        printed: "Original",
        img_style: {
          backgroundColor: "#e7e7e7",
          transform: "rotate(0deg)",
          maxWidth: "100%",
          height: "auto",
        },
      },
      {
        type: "left",
        pulse: { Straight: 280, Turn: 380 },
        switched: "Straight",
        printed: "Printed",
        img_style: {
          backgroundColor: "#FFBF00",
          transform: "rotate(180deg)",
          maxWidth: "100%",
          height: "auto",
        },
      },
      {
        type: "right",
        pulse: { Straight: 380, Turn: 280 },
        switched: "Straight",
        printed: "Printed",
        img_style: {
          backgroundColor: "#FFBF00",
          transform: "rotate(180deg)",
          maxWidth: "100%",
          height: "auto",
        },
      },
      {
        type: "right",
        pulse: { Straight: 380, Turn: 280 },
        switched: "Straight",
        printed: "Printed",
        img_style: {
          backgroundColor: "#FFBF00",
          transform: "rotate(0deg)",
          maxWidth: "100%",
          height: "auto",
        },
      },
      {
        type: "left",
        pulse: { Straight: 280, Turn: 380 },
        switched: "Straight",
        printed: "Printed",
        img_style: {
          backgroundColor: "#FFBF00",
          transform: "rotate(0deg)",
          maxWidth: "100%",
          height: "auto",
        },
      },
    ],
    switches_str: "",
    switchid: 8,
    apihost: process.env.VUE_APP_APIHOST,
    apihost2: process.env.VUE_APP_APIHOST2,
    trains: [
    ],
    hubs: {
    },
    Colors: {
      BLACK: 0,
      PINK: 1,
      PURPLE: 2,
      BLUE: 3,
      LIGHT_BLUE: 4,
      CYAN: 5,
      GREEN: 6,
      YELLOW: 7,
      ORANGE: 8,
      RED: 9,
      WHITE: 10,
      NONE: 255
    }
  };
}

import switchrow from "./switch.vue";
import controller from './controller.vue'
export default {
  name: "Train",
  data: function () {
    return getInitialData();
  },
  components: {
    switchrow,
    controller,
  },
  mounted: function () {
    this.switches_str = JSON.stringify(this.switches, null, 2);
  },
  watch: {
    switches_str: function (val) {
      this.switches = JSON.parse(val);
    },
    switches: function (val) {
      this.switches_str = JSON.stringify(val, null, 2);
    },
    changePulse: function () {
      this.switches_str = JSON.stringify(this.switches, null, 2);
    },
  },
  created: function() {
    this.connection=setWs(this.apihost,this.updateSwitch);
    this.connection2=setWs(this.apihost2,this.updateTrain);
  },
  methods: {
    connectWs(){    
      this.connection=setWs(this.apihost,this.updateSwitch);
      this.connection2=setWs(this.apihost2,this.updateTrain);
    },
    updateSwitch(data) {
      var j_data = data;
      this.switches[j_data.motor].switched = getKeyByValue(this.switches[j_data.motor].pulse,j_data.pulse);
    },
    updateTrain(data) {
      if (data.Status === 'Connected Hubs:'){
        this.trains = data.Message;
        this.fillHubs();
      }
      else if (data.Status === 'Setting Speed...'){
        const t = data.Message;
        this.hubs[t.train]=t;
      }
      else if (data.Status === 'SwitchConfig:'){
        this.switches = data.Message;
      }
    },
    mod2(obj) {
      return [...obj.keys()].filter((i) => i % 2 == 0);
    },
    setDefault() {
      Object.assign(this.$data, getInitialData());
      this.connection=setWs(this.apihost,this.updateSwitch);
      this.connection2=setWs(this.apihost2,this.updateTrain);
      this.switches_str = JSON.stringify(this.switches, null, 2);
      for (var s = 0; s < this.switches.length; s++) {
        this.sendToBE(s);
      }
    },
    deleteAll() {
      this.switches = [];
    },
    deleteOne(_index) {
      this.switches.splice(_index, 1);
    },
    sendToBE(s) {
      const pulse = this.switches[s].pulse[this.switches[s].switched];
      const printed = this.printed_list[this.switches[s].printed];
      const payload = JSON.stringify({ motor: parseInt(s), pulse: pulse, printed });
      this.connection.send(payload);
    },
    insertOne() {
      this.switches.splice(this.switchid, 0, {
        type: this.newtype,
        pulse: this.types[this.newtype][this.printed],
        switched: "Straight",
        printed: this.printed,
        img_style: {
          backgroundColor: this.color,
          transform: this.rotation,
          maxWidth: "100%",
          height: "auto",
        },
      });
      this.switchid++;
    },
    SwitchTrack(s) {
      if (this.switches[s].switched == "Straight") {
        this.switches[s].switched = "Turn";
      } else {
        this.switches[s].switched = "Straight";
      }
      this.sendToBE(s);
    },
    sendAction(s) {
      const payload = { "action":s };
      if (s.includes("Config")){
        payload.config=this.switches;
      }
      console.log(payload);
      this.connection2.send(JSON.stringify(payload));
    },
    getHubs() {
      // console.log(JSON.stringify(this.trains, null, 2));
      // console.log(JSON.stringify(this.hubs, null, 2));
      const payload = JSON.stringify({ "action":"getHubs" });
      console.log(payload);
      this.connection2.send(payload);
    },
    setPower(h) {
      const payload =this.hubs[h];
      payload["action"]="setPower";
      // console.log(payload);
      this.connection2.send(JSON.stringify(payload));
    },
    fillHubs() { 
      this.trains.forEach(train => {
        if ("TRAIN_MOTOR" in train){
          this.$set(this.hubs ,train.NAME , {
            speed: 0,
            train: train.NAME,
            MotorPort: train.TRAIN_MOTOR,
            duration:10000,
            distance:0,
            color: 255});
        }
      });
       // eslint-disable-next-line
      // console.log(JSON.stringify(this.hubs, null, 2));
    }
  },
  
};
</script>
