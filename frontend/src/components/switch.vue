<template>
    <td style="max-width: 220px">
        <b-row no-gutters v-if="switches.length>index" style="border-style: solid; border-color:gray; width: 100%;">
            <div style="max-width: 100%;position: relative" @click="SwitchTrack(index)">
                <img :style="switches[index].img_style" :src="switches[index].switched=='Turn' ? switches[index].type.startsWith('left') ? 'left_turn.png' : 'right_turn.png' : switches[index].type.startsWith('left') ? 'left_streight.png' : 'right_streight.png'" />
                <div style="font-size:12px; color:white; background-color: black ;position: absolute;top: 50%; left: 50%; max-width:50%; opacity: 0.5;">Motor: {{index}}</div>
                <img style="max-width: 10%; height: auto;position: absolute;top: 0%;left: 90%" @click="deleteOne(index)" src='x.png' /></div>
        </b-row>
    </td>
</template>

<script>
export default {
    props: [
        'switches', 
        'index',
        'SwitchTrack',
        'deleteOne',
    ],

};
</script>
