<template lang="pug">
.column
    .card(style="margin:20px")
        .card-header(style="padding:10px")
            h2.title {{title}}
        .card-content
            button.button.is-loading.is-large(v-if="loading" style="border: none")
            .columns(v-else)
                .column 
                    h5.title.is-5 Planlagt tid
                    h3.green.title.is-3 {{time.tid}}
                .column
                    h5.title.is-5 Ny tid
                    h3.red.title.is-3 {{time.nyTid}}
</template>

<script>
export default {
    name: 'TidItem',
    props: ['title', 'time'],
    data: function () {
        return {
            loading: true
        }
    },
    watch: {
        time: function(newTime) {
            if(newTime !== undefined){
                this.loading = false
            } 
        }
    }
}
</script>

<style >
.card {
}
h3,h5 {
    margin: 1rem;
}
.red {
    color: red;
}
.green {
    color: green;
}
</style>

