<template>
    <td style="max-width: 440px">
        <b-row no-gutters v-if="train" style="border-style: solid; border-color:gray; width: 100%;">
            <div style="max-width: 100%;position: relative">
                <h5>{{ train.NAME }}</h5>
                <label>Speed: </label>
                <b-form-input type="range" @change="setPower(train.NAME)"
                    min="-100"
                    max="100"
                    step="10"
                    v-model="hubs[train.NAME].speed">
                </b-form-input><p>{{ hubs[train.NAME].speed }}</p>
                <label v-if="'COLOR_DISTANCE_SENSOR' in train">Distance:</label>
                <b-form-input type="range" @change="setPower(train.NAME)"
                    v-if="'COLOR_DISTANCE_SENSOR' in train"
                    min="0"
                    max="260"
                    step="10"
                    v-model="hubs[train.NAME].distance">
                </b-form-input><p v-if="'COLOR_DISTANCE_SENSOR' in train">{{ hubs[train.NAME].distance }}</p>
                <label v-if="'COLOR_DISTANCE_SENSOR' in train">Color:</label> <b-form-select :style="(hubs[train.NAME].color === 'NONE' ? '' : 'backgroundColor: '+ hubs[train.NAME].color)" v-model="hubs[train.NAME].color" v-if="'COLOR_DISTANCE_SENSOR' in train">
                    <option v-for="(item, key, index) in Colors" :key="index" :value="key" :style="'backgroundColor: '+ key" > 
                    {{ key }}
                    </option>
                </b-form-select><br>
                <label>Runtime:</label><b-form-input type="range" @change="setPower(train.NAME)"
                    min="0"
                    max="300000"
                    step="1000"
                    v-model="hubs[train.NAME].duration">
                </b-form-input><p>{{ hubs[train.NAME].duration/1000 }} sec</p>
            </div>
        </b-row>
    </td>
</template>

<script>


export default {
    props: [
        'train', 
        'hubs',
        'Colors',
        'setPower',
    ]
};
</script>
