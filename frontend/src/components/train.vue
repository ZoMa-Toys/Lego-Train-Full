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
                <b-button @click="goto('swtichControl')" variant="outline-primary">SwitchControl</b-button>
              </div>
            </td>
          </tr>
          <tr  v-for="train in trains" :key="train.NAME" >
            <controller
              :train="train"
              :hubs="hubs"
              :Colors="Colors"
              :setPower="setPower"
              :changeSpeed="changeSpeed">
            </controller>
          </tr>
        </td>
      </tr>
    </table>
    
  </div>
</template>

<script>

function setWs(apihost,dataModFunction){
  // console.log("Starting connection to WebSocket Server")
  const connection = new WebSocket(apihost);

  connection.onmessage = ({data}) => {
    dataModFunction(JSON.parse(data));
    //console.log("input: " + data);
  }

  
  connection.onopen = function() {
    console.log("Successfully connected to the echo websocket server...");
  }
  return connection
}
function getInitialData() {
  return {
    connection: null,
    apihost: "ws://" + location.hostname +":" + process.env.VUE_APP_PORT +"/ws",
    trains: [{NAME:"a",TRAIN_MOTOR:0,COLOR_DISTANCE_SENSOR:1},
    ],
    hubs: {
      "a":{
            speed: 0,
            train: "a",
            MotorPort: 0,
            distanceSlow:0,
            colorSlow: 255,
            distance:0,
            color: 255
        },
    },
    NumberOfHubs: 1,
    NumberOfRemotes: 1,
    Colors: {
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
        this.hubs[t.train]=t;
      }
      else if (data.Status === 'SwitchConfig:'){
        this.switches = data.Message;
      }
    },
    sendAction(s) {
      const payload = { "action":s };
      if (s.includes("Config")){
        payload.config=this.switches;
      }
      else if (s.includes("scan")){
        payload.NumberOfHubs=this.NumberOfHubs;
        payload.NumberOfRemotes=this.NumberOfRemotes;
      }
      //console.log(payload);
      this.connectWs();
      this.connection.send(JSON.stringify(payload));
    },
    getHubs() {
      this.connection.send(JSON.stringify({ "action":"getHubs" }));
    },
    setPower(h) {
      const payload =this.hubs[h];
//      payload.color=this.Colors[payload.color];
      payload["action"]="setPower";
      // console.log(payload);
      this.connection.send(JSON.stringify(payload));
    },
    fillHubs() { 
      this.trains.forEach(train => {
        if ("TRAIN_MOTOR" in train){
          this.hubs[train.NAME]= {
            speed: 0,
            train: train.NAME,
            MotorPort: train.TRAIN_MOTOR,
            distanceSlow:0,
            colorSlow: 255,
            distance:0,
            color: 255};
        }
      });
       // eslint-disable-next-line
      // console.log(JSON.stringify(this.hubs, null, 2));
    },
    goto(page){
      this.$router.replace({ name: page });
    },
    changeSpeed(TrainName,ChangeValue){
      if (ChangeValue===0){
        this.hubs[TrainName].speed = 0;
      }
      else{
        const newValue = Math.max(Math.min(this.hubs[TrainName].speed + ChangeValue,100),-100);
        this.hubs[TrainName].speed=newValue;
      }
      //console.log(this.hubs)
      this.setPower(TrainName);
    }
  },
  
};
</script>
