<template>
    <tr>
        <td style="max-width: 800">
            <div :style="'text-align: center;border-style: solid; border-color:gray;position: relative;fontcolor:black; background: rgba('+ Colors[hubs[train.NAME].traincolor][1]+','+ Colors[hubs[train.NAME].traincolor][2]+','+Colors[hubs[train.NAME].traincolor][3]+',0.3)'">
                <h1> {{ train.NAME }}</h1>
                <b-row no-gutters v-if="train">
                    <div style="text-align: center; margin:auto">
                            <label> Speed: </label>
                            <h1 style="font-size:6em"> {{ hubs[train.NAME].speed }}</h1>
                    </div>
                    <div style="margin-left:auto;">
                        <b-icon icon="plus-circle" style="width: 120px; height: 120px;" @click="changeSpeed(train.NAME,-10)"></b-icon>
                        <br>
                        <b-icon icon="stop-circle" variant="danger" style="width: 120px; height: 120px; " @click="changeSpeed(train.NAME,0)"></b-icon>
                        <br>
                        <b-icon icon="dash-circle" style="width: 120px; height: 120px;" @click="changeSpeed(train.NAME,10)"></b-icon>
                    </div>
                    <div v-if="'COLOR_DISTANCE_SENSOR' in train" style="margin-right:0">
                        <div style="border-style: solid; border-color:gray; ">
                            <label>Slow down if distance is less then: {{ hubs[train.NAME].newdistanceSlow }} </label>
                            <b-form-input type="range" @change="setPower(train.NAME,'distanceSlow')"
                                :min="hubs[train.NAME].newdistance"
                                max="260"
                                step="10"
                                v-model="hubs[train.NAME].newdistanceSlow">
                            </b-form-input>
                            <h5>CurrentValue: {{ hubs[train.NAME].distanceSlow }}</h5>
                            <label>Slow down if color is:</label> 
                                <b-form-select @change="setPower(train.NAME,'colorSlow')" :style="(hubs[train.NAME].colorSlow === 255 ? '' : 'fontcolor:black; background: rgba('+ Colors[hubs[train.NAME].colorSlow][1]+','+ Colors[hubs[train.NAME].colorSlow][2]+','+Colors[hubs[train.NAME].colorSlow][3]+',0.6)')" v-model="hubs[train.NAME].newcolorSlow">
                                <option v-for="(item, ckey) in Colors" :key="ckey" :value="parseInt(ckey)" > 
                                {{ item[0] }}
                                </option>
                            </b-form-select>
                        </div>
                        <div style="border-style: solid; border-color:gray; "> 
                            <label>Stop if distance is less then: {{ hubs[train.NAME].newdistance }}</label>
                            <b-form-input type="range" @change="setPower(train.NAME,'distance')"
                            
                                min="0"
                                max="260"
                                step="10"
                                v-model="hubs[train.NAME].newdistance">
                            </b-form-input>
                            <h5>CurrentValue: {{ hubs[train.NAME].distance }}</h5>
                            <label>Stop if color is:</label> 
                                <b-form-select @change="setPower(train.NAME,'color')" :style="(hubs[train.NAME].color === 255 ? '' : 'fontcolor:black; background: rgba('+ Colors[hubs[train.NAME].color][1]+','+ Colors[hubs[train.NAME].color][2]+','+Colors[hubs[train.NAME].color][3]+',0.5)')" v-model="hubs[train.NAME].newcolor">
                                <option v-for="(item, ckey) in Colors" :key="ckey" :value="parseInt(ckey)" > 
                                {{ item[0] }}
                                </option>
                            </b-form-select>
                        </div>
                    </div>
                </b-row>
            </div>
        </td>
    </tr>
</template>

<script>
import { BIcon } from 'bootstrap-vue'
export default {
    components: {
      BIcon // <- The icon needs to be registered with your page/app
    },
    props: [
        'train', 
        'hubs',
        'Colors',
        'setPower',
        'changeSpeed',
    ]

};
</script>
