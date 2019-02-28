import { setApiError } from '../../../helpers/ehr-utills'

const MAR_PAGE_KEY = 'medAdminRec'
const MED_ORDERS_PAGE_KEY = 'medicationOrders'
const SCHEDULE_FIELDSET = 'schedule'


export default class MarHelper {
  constructor (ehrHelp) {
    this.ehrHelp = ehrHelp
  }
  /*
Compose the schedule periods (e.g. breakfast, lunch, etc) based on the data definitions.
Reach into the medication orders data. Get the first table. Get the cells of this table.
Collect those cells in the schedule fieldset.  WARNING this code is fragile if anyone changes
the key of this fieldset.
For each cell in the schedule fieldset get the data key and display label.
When done we have a list of schedule periods ready to use for any given day of MAR records.
 */
  getSchedulePeriods () {
    let periodDefs = {}
    let orderDefs = this.ehrHelp.getPageDefinition(MED_ORDERS_PAGE_KEY)
    if (orderDefs && orderDefs.tables && orderDefs.tables.length > 0) {
      let cells = orderDefs.tables[0].tableCells
      let medPeriods = cells.filter(cell => cell.fieldset === SCHEDULE_FIELDSET && cell.inputType === 'checkbox')
      medPeriods.forEach(mp => {
        periodDefs[mp.elementKey] = { key: mp.elementKey, name: mp.label, marRecord: {}, hasMar: false }
      })
    } else {
      setApiError(MED_ORDERS_PAGE_KEY + ' can not find table')
    }
    return periodDefs
  }

  getEhrData_Orders () {
    return this.ehrHelp.getAsLoadedPageData(MED_ORDERS_PAGE_KEY)
  }
  getEhrData_Mars () {
    return this.ehrHelp.getAsLoadedPageData(MAR_PAGE_KEY)
  }

  getMarTableKey () {
    let key
    try {
      let marsPageDef = this.ehrHelp.getPageDefinition(MAR_PAGE_KEY)
      let table = marsPageDef.tables[0]
      key = table.tableKey
    } catch (err) {
      setApiError(err)
    }
    return key
  }
  /*
  Get the current list of medication orders. For each see if they are scheduled for any of the schedule periods,
  matching on the data key.  If matched then add the medication into the list of meds to be administered
  in the given schedule period.
   */

  mergeOrdersSchedules (periodDefs, orders) {
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
  }

  mergeMarAndSchedule ( marRecords, periodDefs) {
    marRecords.table.forEach(record => {
      // record.period is the schedule 'key'
      let periodKey = record.period
      Object.keys(periodDefs).forEach(pk => {
        let period = periodDefs[pk]
        let key = period.key
        if (key === periodKey) {
          period.marRecord = record
          period.hasMar = true
        }
      })
    })
  }
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
/*
Search the mar records and see if any apply to the scheduled periods
for "today". If there is a mar for a scheduled period then add it
to the period itself so we can display the record and not display the
add mar button.
 */