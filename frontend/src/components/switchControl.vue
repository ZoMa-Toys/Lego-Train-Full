
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
      <b-button @click="sendAction('getDefaultConfig')" variant="outline-primary">GetDefaultConfig</b-button>
      <b-button @click="rotatetable" variant="outline-primary">RotateTable</b-button>
      <!-- <b-button @click="getSwitchPairs" variant="outline-primary">getSwitchPairs</b-button> -->
      <b-button @click="goto('Train')" variant="outline-primary">TrainControl</b-button>
    </div>
    <div class="shadow p-3 mb-5 rounded" @drop="dontDrop" @dragover="dontDrop" >
      <table>
        <tr>
        <td rowspan=2 :style="'border: 1px solid black;width:200px; height=200px; background-color:'+color"><img draggable="true" @dragstart="drag" width="200" height="200"  @click="rotateImage('leftSwitchStraight')" id="leftSwitchStraight" src="leftSwitchStraight.png"   ></td>
        <td rowspan=2 :style="'border: 1px solid black;width:200px; height=200px; background-color:'+color"><img draggable="true" @dragstart="drag" width="200" height="200"  @click="rotateImage('rightSwitchStraight')" id="rightSwitchStraight" src="rightSwitchStraight.png"></td>
        <td colspan=4>
          <b-form-select v-model="printed">
            <option v-for="(item, key, index) in printed_list" :key="index">
              {{ key }}
            </option>
          </b-form-select>
          <b-form-input type="color"  v-model="color"></b-form-input>
        </td>
        </tr><tr>
        <td :style="'border: 1px solid black; width:100px; height=100px; background-color:'+color"><img draggable="true" @dragstart="drag" width="100" height="100"  @click="rotateImage('curve')" id="curve" src="curve.png"></td>
        <td :style="'border: 1px solid black; width:100px; height=100px; background-color:'+color"><img draggable="true" @dragstart="drag" width="100" height="100"  @click="rotateImage('Straight')" id="Straight" src="Straight.png"></td>
        <td :style="'border: 1px solid black; width:100px; height=100px; background-color:'+color"><img draggable="true" @dragstart="drag" width="100" height="100"  @click="rotateImage('cross')" id="cross" src="cross.png"></td>
        <td :style="'border: 1px solid black; width:100px; height=100px; background-color:'+color"><img draggable="true" @dragstart="drag" width="100" height="100"  id="card" src="card.png"></td>
        </tr>
      </table>
    </div>
      <div class="shadow p-3 mb-5 rounded">
        <table style="margin-left: auto; margin-right: auto;" id="table"></table>
      </div>
      <div class="shadow p-3 mb-5 rounded">
        <b-form-textarea id="tackConf" v-model="conf_str"></b-form-textarea>
      </div>
  </div>
</template>

<script>
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
function setWs(apihost,dataModFunction,sendAction){
  const connection = new WebSocket(apihost);

  connection.onmessage = ({data}) => {
    dataModFunction(JSON.parse(data));
  }

  
  connection.onopen = function() {
    console.log("Successfully connected to the echo websocket server...");
    if(sendAction){
      sendAction('getConfig');
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
      switchPairs:{},
      conf:{},
      conf_str:"",
      motor_witch:[],
      card_witch:[],
      idmap:{},
      color:"#d6ffec",
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
      //apihost: "ws://" + location.hostname +":" + process.env.VUE_APP_PORT +"/switch",
      apihost: "ws://" + location.hostname +":" + process.env.VUE_APP_PORT +"/ws",
/*       apihost: "ws://89.132.204.38/switch",
      apihost: "ws://89.132.204.38/train", */
    };
  },
  created: function() {
   //this.connection=setWs(this.apihost,this.updateSwitch,null);
    this.connection=setWs(this.apihost,this.onMessage,this.sendAction);
  },
  mounted() {
    this.createTable();
  },
   watch: {
    conf_str: function (val) {
      this.conf = JSON.parse(val);
    },
    conf: function (val) {
      this.conf_str = JSON.stringify(val, null, 2);
    },
   },
  methods:{
    connectWs(){ 
/*       if (this.connection.readyState != this.connection.OPEN ){
        this.connection=setWs(this.apihost,this.updateSwitch,null);
      } */
      if (this.connection.readyState != this.connection.OPEN ){
        this.connection=setWs(this.apihost,this.onMessage,null);
      }
    },
    updateConf() {
      for(let key in this.conf){
        let item = this.conf[key];
        let td = document.getElementById(key);
        this.idmap[key]=key
        for (let i of item.img){
          let img = document.createElement("img")
          td.appendChild(img)
          img.style.backgroundColor = i.bgcolor;
          img.id = i.id
          img.src = i.src
          img.width = i.width
          img.height = i.height
          if (i.id.includes("card")){
            img.style.position= i.position;
            img.style.top= i.top;
            img.style.right= i.right;
            this.card_witch[i.index]=i;
            let p = document.createElement("p");
            p.innerHTML = i.index;
            p.style.right= "27px";
            p.style.top = "2px";
            p.style.position= "absolute";
            td.appendChild(p);
          }
          else{
            img.style.transform = i.transform
            if (i.data.includes("Switch")){
              td.innerHTML+="<p>Switch " + item.switch.index + "</p>";
              this.motor_witch[item.switch.index]=key;
              const index=key.split(",");
              const r = parseInt(index[0]);
              const c = parseInt(index[1]);
              td.rowSpan=2;
              td.colSpan=2;
              document.getElementById(r+","+(c+1)).remove();
              document.getElementById((r+1)+","+c).remove();
              document.getElementById((r+1)+","+(c+1)).remove();
              this.idmap[r+","+(c+1)]=key
              this.idmap[(r+1)+","+c]=key
              this.idmap[(r+1)+","+(c+1)]=key
              td.addEventListener("click",this.switchImg);
            }
          }
        }
      }
      this.getSwitchPairs()
    },
    onMessage(data) {
      if ("Status" in data){
        if (data.Status === 'TrackConfig:'){
          this.rows = data.Message.rows;
          this.columns = data.Message.columns;
          this.createTable();
          this.conf = data.Message.conf;
          this.switchPairs = data.Message.switchPairs;
          this.updateConf();
          //this.getSwitchPairs();
        }
        else if (data.Status === 'swtiched'){
          let swid= this.motor_witch[data.Message.motor]
          if(swid !== undefined){
            this.conf[swid].switch.switched = getKeyByValue(this.conf[swid].switch.pulse,data.Message.pulse);
            let img = document.getElementById(swid).firstElementChild 
            img.src=this.changeDirection(img.src)
            this.conf[swid].img.src=this.changeDirection(this.conf[swid].img.src)

          }
        }
      }
    },
    sendAction(s) {
      const payload = { "action":s,"config":{} };
      if (s.includes("Config")){
        payload.config={"conf":this.conf,"rows":this.rows,"columns":this.columns,"switchPairs":this.switchPairs};
      }
      this.connectWs();
      this.connection.send(JSON.stringify(payload));
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
        var copyimg = document.createElement("img");
        var original = document.getElementById(data);
        copyimg.src = original.src;
        if (data=="card" && ev.target.tagName=="IMG"){
          copyimg.id = data + " - address:" + ev.target.parentElement.id;
          copyimg.width = original.width/4;
          copyimg.height = original.height/4;
          copyimg.style.backgroundColor=this.color;
          copyimg.style.position= "absolute";
          copyimg.style.top= 0;
          copyimg.style.right= 0;
          this.card_witch.push(ev.target.parentElement.id);
          ev.target.parentElement.appendChild(copyimg);
          let p = document.createElement("p");
          p.innerHTML = this.card_witch.length-1;
          p.style.right= "27px";
          p.style.top = "2px";
          p.style.position= "absolute";
          ev.target.parentElement.appendChild(p);
          this.conf[ev.target.parentElement.id].img.push({"index":this.card_witch.length-1 ,data,"src":original.src,"width":copyimg.width,"height":copyimg.height,"bgcolor":this.color,"id":data + " - address:" + ev.target.id,"position":copyimg.style.position,"top":copyimg.style.top,"right":copyimg.style.right});
          console.log(this.conf)
        }
        else{
          const index=ev.target.id.split(",");
          const r = parseInt(index[0]);
          const c = parseInt(index[1]);
          copyimg.id = data + " - address:" + ev.target.id;
          copyimg.style.transform = original.style.transform;
          copyimg.width = original.width/2;
          copyimg.height = original.height/2;
          copyimg.style.backgroundColor=this.color;
          if (ev.target.childElementCount){
            ev.target.removeChild(ev.target.childNodes[0]);
          }
          this.idmap[ev.target.id]=ev.target.id;
          this.conf[ev.target.id]={"img":[{data,"src":original.src,"transform":original.style.transform,"width":copyimg.width,"height":copyimg.height,"bgcolor":this.color,"id":data + " - address:" + ev.target.id}],"neighbours":this.setNeighbours(ev.target.id,original.id,original.style.transform)};
          console.log(this.conf)
         if (data.includes("Switch")){
            ev.target.rowSpan=2;
            ev.target.colSpan=2;
            this.idmap[r+","+(c+1)]=ev.target.id;
            this.idmap[(r+1)+","+c]=ev.target.id;
            this.idmap[(r+1)+","+(c+1)]=ev.target.id;
            this.insertOne(data,ev.target.id);
            ev.target.innerHTML+= "<p>Switch "+ this.conf[ev.target.id].switch.index + "</p>";
            document.getElementById(r+","+(c+1)).remove();
            document.getElementById((r+1)+","+c).remove();
            document.getElementById((r+1)+","+(c+1)).remove();
            copyimg.addEventListener("click",this.switchImg);
            //document.addEventListener("click",this.switchImg);
          } 
          ev.target.appendChild(copyimg);
          this.getSwitchPairs()
        }
      }
    },
    allowDrop(ev) {
      ev.preventDefault();
    },
    assignCardToSwitch(){

    },
    dragAway(ev){
      if(ev.dataTransfer.dropEffect !== 'none'){
        let td = ev.target.parentElement;
        td.getElementsByTagName("p")[0].remove();
        if (ev.target.id.includes("Switch")){
          this.RemoveOne(ev.target.id.split(":")[1]);
          const index=td.id.split(",");
          const r = parseInt(index[0]);
          const c = parseInt(index[1]);
          td.innerHTML ="";
          td.rowSpan=1;
          td.colSpan=1;
          this.addCellWithExtra(td.parentElement,c+1,r+","+(c+1))
          this.addCellWithExtra(td.parentElement.parentElement.rows[r+1],c,(r+1)+","+c)
          this.addCellWithExtra(td.parentElement.parentElement.rows[r+1],c+1,(r+1)+","+(c+1))
        }
        else if (ev.target.id.includes("card")){
          const todel = this.card_witch.indexOf(ev.target.id.split(":")[1]);
          this.card_witch.splice(todel, 1);
          //this.card_witch.forEach((element, index) => {this.conf[element].switch.index = index})
        }
        ev.target.remove();
        delete this.conf[td.id];
        let tmp = {...this.conf};
        this.createTable();
        this.conf={...tmp};
        console.log(this.conf)
        this.updateConf();
      }
    },
    addCellWithExtra(el,col,id){
      let td = el.insertCell(col);
      td.id=id;
      td.classList.add("tdclass");
      td.style+="width: 51px; height: 51px;border: 1px solid black;"
      td.addEventListener('drop',this.drop)
      td.addEventListener('dragover',this.allowDrop)
      td.addEventListener('dragend',this.dragAway)
    },
    createTable(){
      console.log(JSON.stringify(this.conf,null,2));
      this.idmap={};
      this.conf={};
      this.motor_witch=[];
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
      const payload = JSON.stringify({"action":"swtichMotor","message":{ motor: sw.index, pulse: pulse, printed }});
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
    rotatetable(){
      let tmp = {}
      this.idmap={}
      for(let key in this.conf){
        const index=key.split(",");
        const c = this.rows - parseInt(index[0])-1;
        const r = parseInt(index[1]);
        let rotation = ((parseInt(this.conf[key].img[0].transform.replace("rotate(","").replace("deg)","")) || 0) +90) %360
        let newID;
        if (this.conf[key].img[0].data.includes("Switch")){
          newID=r+","+(c-1);
          this.idmap[newID]=newID;
          this.idmap[r+","+(c)]=newID;
          this.idmap[(r+1)+","+(c-1)]=newID;
          this.idmap[(r+1)+","+(c)]=newID;
        }
        else{
          newID=r+","+c;
        }
        this.idmap[newID]=newID;

        tmp[newID]=this.conf[key];
        tmp[newID].img[0].transform = "rotate(" + rotation + "deg)"
        tmp[newID].img[0].id=tmp[newID].img[0].id.replace(key,newID)
        tmp[newID].neighbours=this.setNeighbours(newID,tmp[newID].img[0].id.split(" ")[0],tmp[newID].img[0].transform)
      }
      let r = this.rows
      this.rows= this.columns
      this.columns=r
      this.createTable();
      this.conf = tmp;
      this.updateConf();
    },
    setNeighbours(id,type,transform){
      let index = id.split(",")
      let typeconf={
        "leftSwitchStraight":[null,null,"t","s",null,null,"i",null],
        "rightSwitchStraight":[null,null,null,"i",null,null,"s","t"],
        "Straight":[null,"i",null,"o"],
        "curve":[null,"i","o",null],
        "cross":["r","i","l",null],
      }
      let swNeighboursMatrix=[[-1,0],[-1,1],[0,2],[1,2],[2,1],[2,0],[1,-1],[0,-1]]
      let trNeighboursMatrix=[[-1,0],[0,1],[1,0],[0,-1]]
      let matrix = []
      let neighbours={}
      if (type.includes("Switch")){
        matrix=swNeighboursMatrix
      }
      else{
        matrix=trNeighboursMatrix
      }
      for (let i = 0 ;i<parseInt(transform.replace("rotate(","").replace("deg)",""))/90*typeconf[type].length/4;i++){
        typeconf[type].unshift(typeconf[type].pop());
      }
      for (let i =0 ;i<typeconf[type].length;i++){
        if (typeconf[type][i]!=null){
          neighbours[typeconf[type][i]]=(matrix[i][0]+parseInt(index[0]))+","+(matrix[i][1]+parseInt(index[1]))
        }
      }
      return neighbours
    },
    getnextSwitch(id,prevID,origin,port){
      if(Object.entries(this.conf,id) && id != undefined){
        for (const item of Object.entries(this.conf[id].neighbours)) {
          let mvalue =this.idmap[item[1]]
          if(mvalue != prevID && mvalue != id && Object.prototype.hasOwnProperty.call(this.conf, mvalue)){
            if(!this.motor_witch.includes(mvalue)){
              this.getnextSwitch(mvalue,id,origin,port)
            }
            else{
              this.switchPairs[origin][port]=[getKeyByValue(this.conf[mvalue].neighbours,id),mvalue]
            }
          }
        }
      }
      else{
        this.switchPairs[origin][port]=""
      }
    },
    getSwitchPairs(){
      this.switchPairs={}
      this.motor_witch.forEach(id => {
        this.switchPairs[id]={};
        ["i","s","t"].forEach(i => {
          this.switchPairs[id][i]="";
          this.getnextSwitch(this.idmap[this.conf[id].neighbours[i]],id,id,i)
        })
      });
    },
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
td {
  position: relative;
}
p {
  position:absolute; 
  top:2px;
  right:2px;
  font-size:12px;
}

</style>
