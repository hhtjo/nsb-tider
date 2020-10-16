<template lang="pug">
div.has-text-centered
  h1.title.is-1 Ankomst tog Stavanger - Kristiansand
  h2.title.is-3 {{todayDate}}
  .columns
    tid-item(title="NSB" :time="togTider.nsb")
    tid-item(title="BaneNOR" :time="togTider.bNor")

</template>

<script>
import TidItem from './components/tidItem'
const axios = require('axios')

export default {
  name: 'app',
  components: {
    TidItem
  },
  data: function () {
    return {
      togTider: {}
    }
  },
  created: function() {
    axios.get('./main.js').then((response) => {
      this.togTider = response.data
    });
  },
  computed: {
    todayDate: function () {
      let d = new Date();
      return `${d.getDate()}.${d.getMonth()}.${d.getFullYear()}`
    }
  },
}
</script>

<style>
h1 {
  margin: 3rem 1rem;
}
</style>
