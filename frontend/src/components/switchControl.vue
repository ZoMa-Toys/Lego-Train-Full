
<template>
  <div
    id="switchControl"
    class="shadow-lg p-3 mb-5 rounded"
    style="background-color: #f1f1f1"
  >
    <div class="row shadow p-3 mb-5 rounded">
      <number-input
                  :min="2"
                  :max="99"
                  controls
                  v-model="rows"
                ></number-input>
        <number-input
          :min="2"
          :max="99"
          controls
          v-model="columns"
        ></number-input>
      <b-button @click="createTable" variant="primary">SetTable</b-button>
      <b-button @click="sendAction('SetThresHolds')" variant="outline-primary">ReconfigureSensors</b-button>   
      <b-button @click="sendAction('setConfig')" variant="outline-primary">SendConfig</b-button>      
      <b-button @click="sendAction('getConfig')" variant="outline-primary">GetConfig</b-button>
      <b-button @click="transpose" variant="outline-primary">Transpose</b-button>
      <b-button @click="goto('Train')" variant="outline-primary">TrainControl</b-button>
    </div>
    <div class="shadow p-3 mb-5 rounded" @drop="dontDrop" @dragover="dontDrop" >
      <table>
        <tr>
        <td rowspan=2 :style="'border: 1px solid black;width:200px; background-color:'+color"><img draggable="true" @dragstart="drag" width="200" height="200" @click="rotateImage('leftSwitchStraight')" id="leftSwitchStraight" src="leftSwitchStraight.png"   ></td>
        <td rowspan=2 :style="'border: 1px solid black;width:200px; background-color:'+color"><img draggable="true" @dragstart="drag" width="200" height="200" @click="rotateImage('rightSwitchStraight')" id="rightSwitchStraight" src="rightSwitchStraight.png"></td>
        <td colspan=3>
          <b-form-select v-model="printed">
            <option v-for="(item, key, index) in printed_list" :key="index">
              {{ key }}
            </option>
          </b-form-select>
          <b-form-input type="color"  v-model="color"></b-form-input>
        </td>
        </tr><tr>
        <td :style="'border: 1px solid black; width:100px; background-color:'+color"><img draggable="true" @dragstart="drag" width="100" height="100" @click="rotateImage('curve')" id="curve" src="curve.png"></td>
        <td :style="'border: 1px solid black; width:100px; background-color:'+color"><img draggable="true" @dragstart="drag" width="100" height="100" @click="rotateImage('Straight')" id="Straight" src="Straight.png"></td>
        <td :style="'border: 1px solid black; width:100px; background-color:'+color"><img draggable="true" @dragstart="drag" width="100" height="100" @click="rotateImage('cross')" id="cross" src="cross.png"></td>
        </tr>
      </table>
    </div>
      <div class="shadow p-3 mb-5 rounded">
        <table style="margin-left: auto; margin-right: auto;" id="table"></table>
      </div>
  </div>
</template>

<script>
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
function setWs(apihost,dataModFunction,getConfig){
  const connection = new WebSocket(apihost);

  connection.onmessage = ({data}) => {
    dataModFunction(JSON.parse(data));
  }

  
  connection.onopen = function() {
    console.log("Successfully connected to the echo websocket server...");
    if(getConfig){
      getConfig('getConfig');
    }
  }
  return connection
}

export default {
  name: "trackControl",
  data() {
    return { 
      rows:14,
      columns:6,
      conf:{},
      motor_witch:[],
      color:"#d6ffec",
      switchid:0,
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
      apihost: "ws://" + location.hostname +":" + process.env.VUE_APP_PORT +"/switch",
      apihost2: "ws://" + location.hostname +":" + process.env.VUE_APP_PORT +"/train",
/*       apihost: "ws://89.132.204.38/switch",
      apihost2: "ws://89.132.204.38/train", */
    };
  },
  created: function() {
    this.connection=setWs(this.apihost,this.updateSwitch,null);
    this.connection2=setWs(this.apihost2,this.updateConfWS,this.sendAction);
  },
  mounted() {
    this.createTable();
  },
  methods:{
    connectWs(){ 
      if (this.connection.readyState != this.connection.OPEN ){
        this.connection=setWs(this.apihost,this.updateSwitch,null);
      }
      if (this.connection2.readyState != this.connection2.OPEN ){
        this.connection2=setWs(this.apihost2,this.updateConfWS,null);
      }
    },
    updateConf() {
      for(let key in this.conf){
        let item = this.conf[key];
        let td = document.getElementById(key);
        td.style.backgroundColor = item.bgcolor;
        let img;
        if (td.childElementCount){
          img = td.firstElementChild
        }
        else{
          img = document.createElement("img")
          td.appendChild(img)
        }
        img.id = item.img.id
        img.src = item.img.src
        img.style.transform = item.img.transform
        img.width = item.img.width
        if (item.img.data.includes("Switch")){
          this.motor_witch[item.switch.index]=key;
          const index=key.split(",");
          const r = parseInt(index[0]);
          const c = parseInt(index[1]);
          td.rowSpan=2;
          td.colSpan=2;
          document.getElementById(r+","+(c+1)).remove();
          document.getElementById((r+1)+","+c).remove();
          document.getElementById((r+1)+","+(c+1)).remove();
          td.addEventListener("click",this.switchImg);
        }
      }
    },
    updateConfWS(data) {
      if (data.Status === 'TrackConfig:'){
        this.rows = data.Message.rows;
        this.columns = data.Message.columns;
        this.createTable();
        this.conf = data.Message.conf;
        this.updateConf();
      }
    },
    sendAction(s) {
      const payload = { "action":s,"config":{} };
      if (s.includes("Config")){
        payload.config={"conf":this.conf,"rows":this.rows,"columns":this.columns};
      }
      this.connectWs();
      this.connection2.send(JSON.stringify(payload));
    },
    updateSwitch(data) {
      var j_data = data;
      let swid= this.motor_witch[j_data.motor]
      if(swid !== undefined){
        this.conf[swid].switch.switched = getKeyByValue(this.conf[swid].switch.pulse,j_data.pulse);
        let img = document.getElementById(swid).firstElementChild 
        img.src=this.changeDirection(img.src)
        this.conf[swid].img.src=this.changeDirection(this.conf[swid].img.src)
      }
    },
    changeDirection(str){
      if (str.includes("Turn")){
        return str.replace("Turn","Straight")
      }
      else{
        return str.replace("Straight","Turn")
      }
    },
    jsonstring(){
      return JSON.stringify(this.conf,null,2)
    },
    dontDrop(event){
      event.preventDefault();
    },
    rotateImage(id) {
      const el = document.getElementById(id);
      var rotation = ((parseInt(el.style.transform.replace("rotate(","").replace("deg)","")) || 0) +90) %360
        el.style.transform = "rotate(" + rotation + "deg)"
    },
    drag(ev) {
      ev.dataTransfer.setData("text", ev.target.id);
      //ev.dataTransfer.effectAllowed = "copy";
    },
    drop(ev){
      ev.preventDefault();
      let data = ev.dataTransfer.getData("text");
      if (!data.includes("png")){
        const index=ev.target.id.split(",");
        const r = parseInt(index[0]);
        const c = parseInt(index[1]);
        var copyimg = document.createElement("img");
        var original = document.getElementById(data);
        copyimg.src = original.src;
        copyimg.id = data + " - address:" + ev.target.id;
        copyimg.style.transform = original.style.transform;
        copyimg.width = original.width/2;
        ev.target.style.backgroundColor=this.color;
        if (ev.target.childElementCount){
          ev.target.removeChild(ev.target.childNodes[0]);
        }
        this.conf[ev.target.id]={"img":{data,"src":original.src,"transform":original.style.transform,"width":original.width,"id":data + " - address:" + ev.target.id},"bgcolor":this.color};
        if (data.includes("Switch")){
          ev.target.rowSpan=2;
          ev.target.colSpan=2;
          this.insertOne(data,ev.target.id);
          document.getElementById(r+","+(c+1)).remove();
          document.getElementById((r+1)+","+c).remove();
          document.getElementById((r+1)+","+(c+1)).remove();
          copyimg.addEventListener("click",this.switchImg);
          //document.addEventListener("click",this.switchImg);
        } 
        ev.target.appendChild(copyimg);
      }
    },
    allowDrop(ev) {
      ev.preventDefault();
    },
    dragAway(ev){
      if(ev.dataTransfer.dropEffect !== 'none'){
        let td = ev.target.parentElement;
          td.style.backgroundColor="";
        if (ev.target.id.includes("Switch")){
          this.RemoveOne(ev.target.id.split(":")[1]);
          const index=td.id.split(",");
          const r = parseInt(index[0]);
          const c = parseInt(index[1]);
          td.rowSpan=1;
          td.colSpan=1;
          this.addCellWithExtra(td.parentElement,c+1,r+","+(c+1))
          this.addCellWithExtra(td.parentElement.parentElement.rows[r+1],c,(r+1)+","+c)
          this.addCellWithExtra(td.parentElement.parentElement.rows[r+1],c+1,(r+1)+","+(c+1))
          
        }
        ev.target.remove();
        delete this.conf[td.id];
      }
    },
    addCellWithExtra(el,col,id){
      let td = el.insertCell(col);
      td.id=id;
      td.classList.add("tdclass");
      td.style="width: 51px; height: 51px;border: 1px solid black;"
      td.addEventListener('drop',this.drop)
      td.addEventListener('dragover',this.allowDrop)
      td.addEventListener('dragend',this.dragAway)
    },
    createTable(){
      this.conf={};
      let tbl = document.getElementById('table');
      tbl.innerHTML="";
      for(let i=0;i<this.rows;i++){
        const tr = tbl.insertRow();
        for(let j=0;j<this.columns;j++){
          let td = tr.insertCell();
          let id = i+","+j;
          td.id =id;
          td.classList.add("tdclass");
          td.style="width: 51px; height: 51px;border: 1px solid black;"
          td.addEventListener('drop',this.drop)
          td.addEventListener('dragover',this.allowDrop)
          td.addEventListener('dragend',this.dragAway)
        }
      }
    },
    switchImg(ev){
      let td=ev.target;

      this.sendToBE(td.id.split(":")[1])
    },
    sendToBE(s) {
      let sw = {...this.conf[s].switch};
      if (sw.switched == "Straight") {
        sw.switched = "Turn";
      } else {
        sw.switched = "Straight";
      }
      const pulse = sw.pulse[sw.switched];
      const printed = this.printed_list[sw.printed];
      const payload = JSON.stringify({ motor: sw.index, pulse: pulse, printed });
      this.connectWs();
      this.connection.send(payload);
    },
    insertOne(data,id) {
      this.motor_witch.push(id);
      this.conf[id]["switch"]={
          index: this.motor_witch.length-1,
          type: data.includes("left")?"left":"right",
          pulse: this.types[data.includes("left")?"left":"right"][this.printed],
          switched: data.includes("Turn")?"Turn":"Straight",
          printed: this.printed,
      };
    },
    RemoveOne(id) {
      const todel = this.motor_witch.indexOf(id);
      this.motor_witch.splice(todel, 1);
      this.motor_witch.forEach((element, index) => {this.conf[element].switch.index = index})
      //delete this.conf[id].switch;
    },
    goto(page){
      this.$router.replace({ name: page });
    },
    transpose(){
      let tmp = {}
      for(let key in this.conf){
        const index=key.split(",");
        const c = this.rows - parseInt(index[0])-1;
        const r = parseInt(index[1]);
        let rotation = ((parseInt(this.conf[key].img.transform.replace("rotate(","").replace("deg)","")) || 0) +90) %360
        let newID;
        if (this.conf[key].img.data.includes("Switch")){
          newID=r+","+(c-1);
        }
        else{
          newID=r+","+c;
        }
          tmp[newID]=this.conf[key];
          tmp[newID].img.transform = "rotate(" + rotation + "deg)"
          tmp[newID].img.id=tmp[newID].img.id.replace(key,newID)
      }
      let r = this.rows
      this.rows= this.columns
      this.columns=r
      this.createTable();
      this.conf = tmp;
      this.updateConf();
      console.log(this.conf,this.motor_witch)
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
