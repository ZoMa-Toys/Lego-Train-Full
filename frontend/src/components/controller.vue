<template>
    <td style="max-width: 440px">
        <b-row no-gutters v-if="train" style="border-style: solid; border-color:gray; width: 100%;">
            <div style="max-width: 100%;position: relative">
                <h5>{{ train.NAME }}</h5>
                <label>Speed: </label>
                <h2>{{ hubs[train.NAME].speed }}</h2>
                <b-icon icon="dash-circle" style="width: 120px; height: 120px;" @click="changeSpeed(train.NAME,-10)"></b-icon>
                <b-icon icon="stop-circle" variant="danger" style="width: 120px; height: 120px;" @click="changeSpeed(train.NAME,0)"></b-icon>
                <b-icon icon="plus-circle" style="width: 120px; height: 120px;" @click="changeSpeed(train.NAME,10)"></b-icon>
                <br>
                <label v-if="'COLOR_DISTANCE_SENSOR' in train">Stop if distance is less then:</label>
                <b-form-input type="range" @change="setPower(train.NAME)"
                    v-if="'COLOR_DISTANCE_SENSOR' in train"
                    min="0"
                    max="260"
                    step="10"
                    v-model="hubs[train.NAME].distance">
                </b-form-input><p v-if="'COLOR_DISTANCE_SENSOR' in train">{{ hubs[train.NAME].distance }}</p>
                <label v-if="'COLOR_DISTANCE_SENSOR' in train">Stop if color is:</label> 
                    <b-form-select @change="setPower(train.NAME)" :style="(hubs[train.NAME].color === 'NONE' ? '' : 'fontcolor:black; backgroundColor: '+ hubs[train.NAME].color)" v-model="hubs[train.NAME].color" v-if="'COLOR_DISTANCE_SENSOR' in train">
                    <option v-for="(item, ckey) in Colors" :key="ckey" :value="ckey" > 
                    {{ ckey }}
                    </option>
                </b-form-select><br>
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
