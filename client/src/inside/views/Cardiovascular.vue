// Generated VUE file. Before modifying see docs about Vue file generation
<template lang="pug">
  div(class="ehr-page")
    ehr-panel-header {{ uiProps.pageTitle }}
      div(slot="controls", v-show="showPageFormControls")
        ehr-edit-controls(:ehrHelp="ehrHelp", :pageDataKey="pageDataKey")
    ehr-panel-content
      div(class="region ehr-page-content")
        ehr-page-form(v-if="uiProps.hasForm", :ehrHelp="ehrHelp", :pageDataKey="pageDataKey",)
        div(v-if="uiProps.hasTable", v-for="tableDef in uiProps.tables", :key="tableDef.tableKey")
          ehr-page-table(:tableDef="tableDef", :ehrHelp="ehrHelp", :pageDataKey="pageDataKey")
      div Page updated: {{ ehrHelp.formatDate(uiProps.generated) }}
    div(style="display:none")
      p This Cardiovascular page is generated.
      p Label: Cardiovascular
      p Data Key: cardiovascular
      p Component name: Cardiovascular
      p Redirect: 
      p Route name: cardiovascular
      p Full path: /ehr/current/assessments/cardiovascular
</template>

<script>
import EhrPanelHeader from '../components/EhrPanelHeader.vue'
import EhrPanelContent from '../components/EhrPanelContent.vue'
import EhrEditControls from '../components/EhrEditControls.vue'
import EhrPageTable from '../components/EhrPageTable'
import EhrPageForm from '../components/EhrPageForm.vue'
import EhrHelp from '../../helpers/ehr-helper'

export default {
  name: 'Cardiovascular',
  components: {
    EhrPanelHeader,
    EhrPanelContent,
    EhrPageForm,
    EhrPageTable,
    EhrEditControls
  },
  data: function () {
    return {
      pageDataKey: 'cardiovascular',
      ehrHelp: undefined
    }
  },
  computed: {
    uiProps () {
      return this.ehrHelp ? this.ehrHelp.getPageDefinition(this.pageDataKey) : {}
    },
    showPageFormControls () {
      return this.ehrHelp.showPageFormControls()
    }
  },
  created () {
    this.ehrHelp = new EhrHelp(this, this.$store, this.pageDataKey, this.uiProps)
  },
  beforeRouteLeave (to, from, next) {
    this.ehrHelp.beforeRouteLeave(to, from, next)
  },
  beforeDestroy: function () {
    this.ehrHelp.beforeDestroy(this.pageDataKey)
  }
}
</script>

<style lang="scss" scoped></style>
