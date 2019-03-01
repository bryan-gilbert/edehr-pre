<template lang="pug">
  div
    div Who administered: {{ record.who }}
    div Scheduled time: {{ record.period }}
    div Actual time: {{ record.when }}
    med-list(:medsList="record.medications")
</template>

<script>
import MedList from './MedList'
export default {
  name: 'MarRecord',
  components: {
    MedList
  },
  props: {
    record: { type: Object },
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
  .medList {
    margin-left: 30px;
  }
</style>