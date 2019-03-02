<template lang="pug">
  div
    h1 Medication Administration Summary
    div(v-for="record in marRecords")
      mar-record(:record="record")
</template>

<script>
import MarRecord from './MarRecord'

export default {
  name: 'MarSummary',
  components: {
    MarRecord
  },
  data () {
    return {
    }
  },
  props: {
    marRecords: {
      // to accept any object type we provide a validator that accepts all types
      validator: function (/*value*/) {
        return true
      }
    },
    marHelper: { type: Object }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>