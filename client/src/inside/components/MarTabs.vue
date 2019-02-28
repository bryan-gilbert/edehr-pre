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
import MarTodayContent from './mar/MarTodayContent'
import { setApiError } from '../../helpers/ehr-utills'
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
      marTableKey: ''
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
      /*
      Compose the schedule periods (e.g. breakfast, lunch, etc) based on the data definitions.
      Reach into the medication orders data. Get the first table. Get the cells of this table.
      Collect those cells in the schedule fieldset.  WARNING this code is fragile if anyone changes
      the key of this fieldset.
      For each cell in the schedule fieldset get the data key and display label.
      When done we have a list of schedule periods ready to use for any given day of MAR records.
       */
      let periodDefs = {}
      let orderDefs = this.ehrHelp.getPageDefinition('medicationOrders')
      if (orderDefs && orderDefs.tables && orderDefs.tables.length > 0) {
        let cells = orderDefs.tables[0].tableCells
        let medPeriods = cells.filter(cell => cell.fieldset === 'schedule' && cell.inputType === 'checkbox')
        medPeriods.forEach(mp => {
          periodDefs[mp.elementKey] = { key: mp.elementKey, name: mp.label, marRecord: {}, hasMar: false }
        })
      }
      this.periodDefs = periodDefs
      /*
      Get the current list of medication orders. For each see if they are scheduled for any of the schedule periods,
      matching on the data key.  If matched then add the medication into the list of meds to be administered
      in the given schedule period.
       */
      let orders = this.ehrHelp.getAsLoadedPageData('medicationOrders')
      this.theMedOrders = orders
      let ordersList = orders.table
      if (ordersList) {
        ordersList.forEach(medication => {
          Object.keys(periodDefs).forEach(pk => {
            let period = periodDefs[pk]
            let key = period.key
            if (medication[key]) {
              period.medsList = period.medsList || []
              period.medsList.push(medication)
            }
          })
        })
      }
      /*
      Get the MAR records.
      TODO update the following documentation
      Each MAR records will have a date and schedule key.  Plus
        Date
        ScheduleKey (time)
        Administered By
        Actual Time Administered
        Comment
        Medications

      On the Today page we will list any MARs that apply. I.e. they are for "today" and for the a schedule time.
      If there is no MAR for a period of today then we display a button to open a dialog to create the MAR
      for that period.

      On the summary page we will list all medications
        medication text (name, dosage, etc)
        list of MARS for this medication
          each MAR shows:  scheduled time, actual time, and by who

    Task List
    1. Add button and dialog to create a MAR
    2. store MAR under this page's data.  Array of records.
    */
      try {
        let marsPageDef = this.ehrHelp.getPageDefinition(this.pageDataKey)
        let table = marsPageDef.tables[0]
        this.marTableKey = table.tableKey
      } catch (err) {
        setApiError(err)
      }
      /*
      Search the mar records and see if any apply to the scheduled periods
      for "today". If there is a mar for a scheduled period then add it
      to the period itself so we can display the record and not display the
      add mar button.
       */
      let marRecords = this.ehrHelp.getAsLoadedPageData(this.pageDataKey)
      this.marRecords = marRecords
      marRecords.table.forEach( record => {
        // record.period is the schedule 'key'
        let periodKey = record.period
        Object.keys(periodDefs).forEach(pk => {
          let period = periodDefs[pk]
          let key = period.key
          if ( key === periodKey ) {
            period.marRecord = record
            period.hasMar = true
          }
          // todo match up
        })
      })

    }
  },
  mounted: function () {
    const _this = this
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
