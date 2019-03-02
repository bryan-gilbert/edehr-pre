import { setApiError } from '../../../helpers/ehr-utills'
import { getPageDefinition } from '../../../helpers/ehr-defs'
import { SCHEDULE_FIELDSET, MED_ORDERS_PAGE_KEY } from './mar-util'
import PeriodEntity from './period-entity'

/**
 Compose the schedule periods (e.g. breakfast, lunch, etc) based on the data definitions.
 Reach into the medication orders data. Get the first table. Get the cells of this table.
 Collect those cells in the schedule fieldset.  WARNING this code is fragile if anyone changes
 the key of this fieldset.
 For each cell in the schedule fieldset get the data key and display label.
 When done we have a list of schedule periods ready to use for any given day of MAR records.
 */

export default class PeriodDefs {
  constructor () {
    let medOrdersPageDefs = getPageDefinition(MED_ORDERS_PAGE_KEY)
    let periodDefs = {}
    let periodKeys = []
    if (medOrdersPageDefs && medOrdersPageDefs.tables && medOrdersPageDefs.tables.length > 0) {
      let cells = medOrdersPageDefs.tables[0].tableCells
      let medPeriods = cells.filter(cell => cell.fieldset === SCHEDULE_FIELDSET && cell.inputType === 'checkbox')
      medPeriods.forEach(mp => {
        let k = mp.elementKey
        periodKeys.push(k)
        periodDefs[k] = new PeriodEntity(k, mp.label)
        // { key: k, name: mp.label, marRecord: {}, hasMar: false }
      })
    } else {
      setApiError(MED_ORDERS_PAGE_KEY + ' can not find table')
    }
    this._periodDefs = periodDefs
    this._periodKeys = periodKeys
  }

  get periodList () { return this._periodDefs}
  get periodKeys() { return this._periodKeys }

  clearMedications() {
    this._periodKeys.forEach(pk => {
      this._periodDefs[pk].clearMedications()
    })
  }


  validScheduledTime(value) {
    let result =  this._periodKeys.includes(value)
    // console.log('PeriodDefs validScheduledTime', value, result, this._periodKeys)
    return result
  }

  /**
   * Reset the list of meds to administer "today" into the periods based
   * on the live data contents from the medications orders page
   *
   Get the current list of medication orders. For each see if they are scheduled for any of the schedule periods,
   matching on the data key.  If matched then add the medication into the list of meds to be administered
   in the given schedule period.
   *
   * @param  {MedOrder[] } medOrders
   */
  mergeOrdersSchedules (medOrders) {
    this.clearMedications()
    console.log('merging ', medOrders)
    let periodDefs = this._periodDefs
    let periodKeys = this._periodKeys
    medOrders.forEach(medOrder => {
      periodKeys.forEach(pk => {
        let period = periodDefs[pk]
        console.log( pk, period, medOrder[pk])
        if (medOrder.isScheduled(pk)) {
          period.addMedication(medOrder)
        }
      })
    })
  }

  /**
   *
   * @param marRecords MarEntity[]
   */
  mergeMarAndSchedule (marRecords) {
    let periodDefs = this._periodDefs
    console.log('merge mar and schedule', marRecords)
    marRecords.forEach(record => {
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