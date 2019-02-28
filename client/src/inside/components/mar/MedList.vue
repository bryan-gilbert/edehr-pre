<template lang="pug">
  div
    div(class="medList", v-for="med in medsList")
      div {{ medText(med) }}
</template>

<script>
export default {
  name: 'MedList',
  props: {
    medsList: { type: Array },
  },
  methods: {
    medText (med) {
      let space = ', '
      let extract = t => t && t.trim().length > 0 ? space + t : ''
      let markup = med.medication
      markup += extract(med.dose)
      markup += extract(med.route)
      markup += extract(med.type)
      markup += extract(med.notes)
      return markup
    }
  }
}
</script>

<style lang="scss" scoped>
  .medList {
    margin-left: 30px;
  }
</style>