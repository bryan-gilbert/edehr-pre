<template lang="pug">
  div(class="content")
    tabs
      tab(name="Today", :selected="true")
      div
        mar-today-content(:periodDefs="periodDefs", :marHelper="marHelper")

      tab(name="Summary")
        mar-summary(:marRecords="marRecords", :marHelper="marHelper")

        div(style="display:block") {{medicationOrders}}
        div(style="display:block") {{mars}}
</template>

<script>
import EventBus from '../../helpers/event-bus'
import AppDialog from '../../app/components/AppDialogShell'
import UiButton from '../../app/ui/UiButton'
import MedList from './mar/MedList'
import MarHelper from './mar/mar-util'
import MarSummary from './mar/MarSummary'
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
    MarSummary,
    MedList,
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
      currentDay: 0,
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
      return this.marRecords
    },
  },
  methods: {
    refresh () {
      if (this.marHelper) {
        let help = this.marHelper
        help.refresh()
        this.marTableKey = help.getMarTableKey
        this.marRecords = help.marRecords
        this.periodDefs = help.periodDefs
        this.theMedOrders = help.getEhrData_Orders
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
