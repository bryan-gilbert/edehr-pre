<template lang="pug">
  div
    h1 Medication Administration Records
    div(class="periodsList", v-for="period in periodDefs")
      h4 {{ period.name }}
      div(class="columns")
        div(class="column")
          med-list(:medsList="period.medsList")
        div(class="column")
          div(v-show="!period.hasMar")
            ui-button(v-on:buttonClicked="openMarDialog(period)") Add MAR
          div(v-show="period.hasMar")
            mar-record(:record="period.marRecord")
      hr
    app-dialog( v-if="showMarDialog", :isModal="true", @cancel="cancelDialog", @save="saveDialog")
      h3(slot="header") Add MAR
      div(slot="body")
        div
          div Period: {{activePeriod.name}}
          div Medications:
          div(class="medList", v-for="med in activePeriod.medsList")
            div {{ marHelper.medText(med) }}
          div(class="input-fieldrow")
            div(class="ehrdfe")
              div(class="text_input_wrapper")
                label Who administered
                input(class="input", type="text", v-model="aMar.who")
            div(class="ehrdfe")
              div(class="text_input_wrapper")
                label Actual time
                input(class="input", type="text", v-model="aMar.when")
          div(class="input-fieldrow")
            div(class="ehrdfe")
              label Comment
              div(class="input-element input-element-full")
                textarea(class="textarea",v-model="aMar.comment")

</template>

<script>
import MedList from './MedList'
import UiButton from '../../../app/ui/UiButton'
import MarRecord from './MarRecord'
import AppDialog from '../../../app/components/AppDialogShell'

export default {
  name: 'MarTodayContent',
  components: {
    UiButton,
    AppDialog,
    MedList,
    MarRecord
  },
  data () {
    return {
      aMar: {},
      activePeriod: {},
      showMarDialog: false
    }
  },
  props: {
    periodDefs: { type: Object },
    marHelper: { type: Object }
  },
  methods: {
    openMarDialog (period) {
      this.activePeriod = period
      this.showMarDialog = true
    },
    cancelDialog: function () {
      this.showMarDialog = false
    },
    saveDialog: function () {
      const _this = this
      this.marHelper.saveMarDialog(this.aMar, this.activePeriod)
        .then(() => {
          _this.showMarDialog = false
        })
    }
  }
}
</script>

<style scoped>

</style>