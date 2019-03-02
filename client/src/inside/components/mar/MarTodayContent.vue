<template lang="pug">
  div
    h1 Medication Administration Records
    div Today is: {{ currentDay }}
    div(class="periodsList", v-for="period in periodDefs")
      h4 {{ period.name }}
      div(class="columns")
        div(class="column")
          med-list(:medsList="period.medsList")
        div(class="column")
          div(v-show="!period.hasMar")
            ui-button(v-on:buttonClicked="openMarDialog(period)") Add MAR
          div(v-show="period.hasMar")
            mar-record(:record="period.marRecord || {}")
      hr
    app-dialog( v-if="showMarDialog", :isModal="true", @cancel="cancelDialog", @save="saveDialog")
      h3(slot="header") Add MAR
      div(slot="body")
        div
          div Day: {{currentDay}}
          div Period: {{activePeriod.name}}
          div Medications:
          med-list(:medsList="activePeriod.medsList")
          div(class="input-fieldrow")
            div(class="ehrdfe")
              div(class="text_input_wrapper")
                label Who administered
                input(class="input", type="text", v-model="who")
            div(class="ehrdfe")
              div(class="text_input_wrapper")
                label Actual time
                input(class="input", type="text", v-model="when")
          div(class="input-fieldrow")
            div(class="ehrdfe")
              label Comment
              div(class="input-element input-element-full")
                textarea(class="textarea",v-model="comment")
          div(v-show="errorMesageList.length > 0", class="errorMesageList")
            li(v-for="error in errorMesageList") {{ error }}


</template>

<script>
import MedList from './MedList'
import UiButton from '../../../app/ui/UiButton'
import MarRecord from './MarRecord'
import AppDialog from '../../../app/components/AppDialogShell'
import MarEntity from './mar-entity'

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
      who: '',
      when: '',
      comment: '',
      activePeriod: {},
      currentDay: 0,
      errorMesageList: [],
      showMarDialog: false
    }
  },
  props: {
    periodDefs: { type: Object },
    marHelper: { type: Object }
  },
  methods: {
    openMarDialog (period) {
      this.aMar = {}
      this.activePeriod = period
      this.showMarDialog = true
    },
    cancelDialog: function () {
      this.showMarDialog = false
    },
    saveDialog: function () {
      const _this = this
      let mar = new MarEntity(this.who, this.currentDay, this.when, this.comment, this.activePeriod)
      this.errorMesageList = mar.validate()
      if(this.errorMesageList.length > 0) {
        return
      }
      this.marHelper.saveMarDialog(mar)
        .then(() => {
          _this.showMarDialog = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../scss/definitions';
.errorMesageList {
  color: $dialog-error-color;
}
</style>