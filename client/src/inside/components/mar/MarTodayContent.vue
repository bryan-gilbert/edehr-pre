<template lang="pug">
  div
    h1 Medication Administration Records
    div(class="periodsList", v-for="period in periodDefs")
      div {{ period.name }}
      med-list(:medsList="period.medsList")
      div(v-show="!period.hasMar")
        ui-button(v-on:buttonClicked="openMarDialog(period)") Add MAR
      div(v-show="period.hasMar")
        mar-record(:record="period.marRecord")
      hr

</template>

<script>
import MedList from './MedList'
import UiButton from '../../../app/ui/UiButton'
import MarRecord from './MarRecord'

export default {
  name: 'MarTodayContent',
  components: {
    UiButton,
    MedList,
    MarRecord
  },
  props: {
    periodDefs: { type: Object },
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
    },
    medRecord (med) {
      let space = ', '
      let extract = (m, r, k) => {
        let t = r[k]
        if (t && t.trim().length > 0) {
          m[k] = t
        }
      }
      let markup = {}
      extract(markup, med, 'medication',)
      extract(markup, med, 'dose',)
      extract(markup, med, 'type',)
      extract(markup, med, 'notes',)
      return markup
    },
    openMarDialog (period) {
    },
    cancelDialog: function() {
    }
  }
}
</script>

<style scoped>

</style>