<template>
    <td @drop="drop" @dragover="allowdrop" @drag="getAway">
    </td>
</template>

<script>
export default {
    props: [
        'drop', 
        'allowdrop',
        'getAway',
        'conf',
    ],

};
</script>
