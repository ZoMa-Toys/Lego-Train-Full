<template>
    <td style="max-width: 440px">
        <b-row no-gutters v-if="train" style="border-style: solid; border-color:gray; width: 100%;">
            <div :style="'max-width: 100%;position: relative;' + 'fontcolor:black; background: rgba('+ Colors[hubs[train.NAME].traincolor][1]+','+ Colors[hubs[train.NAME].traincolor][2]+','+Colors[hubs[train.NAME].traincolor][3]+',0.3)'">
                <h5>{{ train.NAME }}</h5>
                <label>Speed: </label>
                <h2>{{ hubs[train.NAME].speed }}</h2>
                <b-icon icon="dash-circle" style="width: 120px; height: 120px;" @click="changeSpeed(train.NAME,-10)"></b-icon>
                <b-icon icon="stop-circle" variant="danger" style="width: 120px; height: 120px;" @click="changeSpeed(train.NAME,0)"></b-icon>
                <b-icon icon="plus-circle" style="width: 120px; height: 120px;" @click="changeSpeed(train.NAME,10)"></b-icon>
                <div v-if="'COLOR_DISTANCE_SENSOR' in train">
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
                    </b-form-select><br>
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
    </td>
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
