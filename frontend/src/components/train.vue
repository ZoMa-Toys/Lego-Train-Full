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
            <td colspan="4">
              <div class="row">
                Number of Hubs:
                <number-input
                  :min="0"
                  :max="8-NumberOfRemotes"
                  controls
                  v-model="NumberOfHubs"
                ></number-input>
                Number of Remotes:
                <number-input
                  :min="0"
                  :max="8-NumberOfHubs"
                  controls
                  v-model="NumberOfRemotes"
                ></number-input>
                <b-button @click="sendAction('scan')" variant="outline-primary">startScan</b-button>
                <b-button @click="sendAction('stop')" variant="danger">stopScan</b-button>
                <b-button @click="sendAction('getHubs')" variant="primary">getHubs</b-button>
                <b-button @click="sendAction('disconnectHubs')" variant="danger">disconnectAllHub</b-button>
                <b-button @click="sendAction('resetCardMap')" variant="danger">resetCardMap</b-button>
                <b-button @click="goto('swtichControl')" variant="outline-primary">SwitchControl</b-button>
              </div>
            </td>
          </tr>
            <controller v-for="train in trains" v-bind:key="train.NAME" 
              v-bind:train="train"
              v-bind:hubs="hubs"
              v-bind:Colors="Colors"
              v-bind:setPower="setPower"
              v-bind:changeSpeed="changeSpeed"
              v-bind:changeLight="changeLight">
            </controller>
        </td>
      </tr>
    </table>
    
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
function getInitialData() {
  return {
    connection: null,
    apihost: "ws://" + location.hostname +":" + (process.env.VUE_APP_PORT?process.env.VUE_APP_PORT:location.port) +"/ws",
    trains: [{NAME:"DUMMY",TRAIN_MOTOR:0,COLOR_DISTANCE_SENSOR:1,LIGHT:2,traincolor:1},
    ],
    hubs: {
      "DUMMY":{
            speed: 0,
            train: "DUMMY",
            traincolor:1,
            MotorPort: 0,
            distanceSlow:0,
            colorSlow: 255,
            distance:0,
            color: 255,
            light: 0,
            newdistanceSlow:0,
            newcolorSlow: 255,
            newdistance:0,
            newcolor: 255,
            newlight: 0,
        },
    },
    NumberOfHubs: 1,
    NumberOfRemotes: 1,
    ColorsOld: {
      BLACK: 0,
      PINK: 1,
      PURPLE: 2,
      BLUE: 3,
      LIGHTBLUE: 4,
      CYAN: 5,
      GREEN: 6,
      YELLOW: 7,
      ORANGE: 8,
      RED: 9,
      WHITE: 10,
      NONE: 255
    },
    Colors:{
      0:["BLACK",0,0,0],
      1:["PINK",255,192,203],
      2:["PURPLE",128,0,128],
      3:["BLUE",0,0,255],
      4:["LIGHTBLUE",173,216,230],
      5:["CYAN",0,255,255],
      6:["GREEN",0,128,0],
      7:["YELLOW",255,255,0],
      8:["ORANGE",255,155,0],
      9:["RED",255,0,0],
      10:["WHITE",255,255,255],
      255:["NONE",255,255,255],   
    }
  };
}

import controller from './controller.vue';
export default {
  name: "Train",
  data: function () {
    return getInitialData();
  },
  components: {
    controller,
  },
  watch: {
  },
  created: function() {
    this.connection=setWs(this.apihost,this.updateTrain,null);
  },
  methods: {
    connectWs(){ 
      if (this.connection.readyState != this.connection.OPEN ){
        this.connection=setWs(this.apihost,this.updateTrain,null);
      }
    },
    updateTrain(data) {
      if (data.Status === 'Connected Hubs:'){
        this.trains = data.Message;
        this.fillHubs();
      }
      else if (data.Status === 'Setting Speed...'){
        const t = data.Message;
        if ("speed" in t) this.hubs[t.train].speed=t.speed;
        if ("speed" in t) this.hubs[t.train].newspeed=t.speed;
        if ("distanceSlow" in t) this.hubs[t.train].distanceSlow=t.distanceSlow;
        if ("distanceSlow" in t) this.hubs[t.train].newdistanceSlow=t.distanceSlow;
        if ("colorSlow" in t) this.hubs[t.train].colorSlow=t.colorSlow ;
        if ("colorSlow" in t) this.hubs[t.train].newcolorSlow=t.colorSlow ;
        if ("distance" in t) this.hubs[t.train].distance=t.distance;
        if ("distance" in t) this.hubs[t.train].newdistance=t.distance;
        if ("color" in t) this.hubs[t.train].color=t.color ;
        if ("color" in t) this.hubs[t.train].newcolor=t.color ;
        if ("light" in t) this.hubs[t.train].light=t.light ;
        if ("light" in t) this.hubs[t.train].newlight=t.light ;
        this.hubs = {...this.hubs};
      }

    },
    sendAction(s) {
      const payload = { "action":s };
      if (s.includes("scan")){
        payload["NumberOfHubs"]=this.NumberOfHubs;
        payload["NumberOfRemotes"]=this.NumberOfRemotes;
      }
      this.connectWs();
      this.connection.send(JSON.stringify(payload));
    },
    setPower(h,key) {
      const payload = {};
      payload["action"]="setPower";
      payload['message'] = {};
      payload.message["train"]=this.hubs[h].train;
      payload.message[key]=this.hubs[h]["new"+key];
      this.connectWs();
      this.connection.send(JSON.stringify(payload));
    },
    fillHubs() { 
      this.hubs={};
      this.trains.forEach(train => {
        if ("TRAIN_MOTOR" in train){
          this.hubs[train.NAME]= {
            speed: 0,
            train: train.NAME,
            traincolor:train.traincolor,
            MotorPort: train.TRAIN_MOTOR,
            distanceSlow:0,
            colorSlow: 255,
            distance:0,
            color: 255,
            newdistanceSlow:0,
            newcolorSlow: 255,
            newdistance:0,
            newcolor: 255,
            light:0,
            newlight:0};
        }
      });
    },
    goto(page){
      this.$router.replace({ name: page });
    },
    changeSpeed(TrainName,ChangeValue){
      if (ChangeValue===0){
        this.hubs[TrainName].newspeed  =0;
      }
      else{
        this.hubs[TrainName].newspeed = Math.max(Math.min(this.hubs[TrainName].speed + ChangeValue,100),-100);
      }
      this.setPower(TrainName,"speed");     
    },
    changeLight(TrainName,ChangeValue){
      if (ChangeValue===0){
        this.hubs[TrainName].newlight  =0;
      }
      else{
        this.hubs[TrainName].newlight = Math.max(Math.min(this.hubs[TrainName].light + ChangeValue,100),-100);
      }
      this.setPower(TrainName,"light");     
    }
  },
  
};
</script>
