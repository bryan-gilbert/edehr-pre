<template lang="pug">
  div(class="content")
    tabs
      tab(name="Today", :selected="true")
        mar-today-content(:periodDefs="periodDefs")

      tab(name="Summary")
        h1 Medication Administration Summary
        div To be developed
        div(v-for="record in marRecords.table")
          mar-record(:record="record")

        div(style="display:block") {{medicationOrders}}
        div(style="display:block") {{mars}}

    app-dialog( v-if="showMarDialog", :isModal="true", @cancel="cancelDialog", @save="saveDialog")
      h3(slot="header") Add MAR
      div(slot="body")
        div
          div Period: {{activePeriod.name}}
          div Medications:
          div(class="medList", v-for="med in activePeriod.medsList")
            div {{ medText(med) }}
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
import EventBus from '../../helpers/event-bus'
import AppDialog from '../../app/components/AppDialogShell'
import UiButton from '../../app/ui/UiButton'
import MedList from './mar/MedList'
import MarRecord from './mar/MarRecord'
import MarHelper from './mar/mar-util'
import MarTodayContent from './mar/MarTodayContent'
import { PAGE_DATA_REFRESH_EVENT } from '../../helpers/event-bus'
import Tabs from './Tabs'
import Tab from './Tab'

export default {
  name: 'home',
  components: {
    AppDialog,
    UiButton,
    MarTodayContent,
    MedList,
    MarRecord,
    Tabs,
    Tab
  },
  data () {
    return {
      theMedOrders: {},
      marRecords: {},
      mars: {},
      aMar: {},
      activePeriod: {},
      periodDefs: {},
      showMarDialog: false,
      marTableKey: '',
      marHelper: undefined
    }
  },
  props: {
    pageDataKey: { type: String },
    ehrHelp: { type: Object }
  },
  computed: {
    medicationOrders () {
      // See EhrPageForm for more on why we have currentData
      this.refresh()
      return this.theMedOrders
    },
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
        if(t && t.trim().length > 0) {
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
    openMarDialog(period) {
      this.activePeriod = period
      this.showMarDialog = true
    },
    cancelDialog: function() {
      this.showMarDialog = false
    },
    saveDialog: function() {
      const _this = this
      console.log('saveDialog ')
      let asLoadedPageData = this.ehrHelp.getAsLoadedPageData(this.pageDataKey)
      let table = asLoadedPageData[this.marTableKey] || []
      let aMar = this.aMar
      aMar.medications = []
      aMar.period = this.activePeriod.key
      _this.activePeriod.medsList.forEach( med => {
        aMar.medications.push(_this.medRecord(med))
      })
      table.push(aMar)
      let payload = {
        propertyName: this.pageDataKey,
        value: asLoadedPageData
      }
      this.ehrHelp._saveData(payload).then(() => {
        _this.showMarDialog = false
      })
      this.ehrHelp.saveDialog()
    },

    refresh () {
      if (this.marHelper) {
        let help = this.marHelper
        this.marTableKey = help.getMarTableKey()
        this.periodDefs = help.getSchedulePeriods()
        console.log('refresh end ', this.periodDefs)
        this.theMedOrders = help.getEhrData_Orders()
        help.mergeOrdersSchedules(this.periodDefs, this.theMedOrders)
        this.marRecords = help.getEhrData_Mars()
        help.mergeMarAndSchedule(this.marRecords, this.periodDefs)
        console.log('refresh end ', this.periodDefs)
      }
    }
  },
  mounted: function () {
    const _this = this
    this.marHelper = new MarHelper(this.ehrHelp)
    this.refreshEventHandler = function () {
      _this.refresh()
    }
    EventBus.$on(PAGE_DATA_REFRESH_EVENT, this.refreshEventHandler)
  },
  beforeDestroy: function () {
    if (this.refreshEventHandler) {
      EventBus.$off(PAGE_DATA_REFRESH_EVENT, this.refreshEventHandler)
    }
  }
}
</script>

<style lang="scss" scoped>
.medList {
  margin-left: 30px;
}
</style>
