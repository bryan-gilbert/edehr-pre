import { setApiError, validTimeStr, validDayStr } from '../../../helpers/ehr-utills'
import MedOrder from './medOrder-entity'
import MarEntity from './mar-entity'
import PeriodEntity from './period-entity'
import PeriodDefs from './period-defs'

export const MAR_PAGE_KEY = 'medAdminRec'
export const MED_ORDERS_PAGE_KEY = 'medicationOrders'
export const SCHEDULE_FIELDSET = 'schedule'

export default class MarHelper {
  constructor (ehrHelp) {
    this.ehrHelp = ehrHelp
    this._marTableKey = this.getMarTableKey()
    this._periodDefs = new PeriodDefs()
  }

  refresh () {
    this._theMedOrders = this.getEhrData_Orders()
    this._marRecords = this.getEhrData_MarRecords()
    this._periodDefs.mergeOrdersSchedules(this._theMedOrders)
    this._periodDefs.mergeMarAndSchedule(this._marRecords)
  }
  get marTableKey () { return this._marTableKey }
  get periodDefs () { return this._periodDefs.periodList }
  get theMedOrders () { return this._theMedOrders }
  get marRecords () { return this._marRecords }
  /**
   * Get the medication orders current page data
   * @return {*}
   */
  getEhrData_Orders () {
    let pageData = this.ehrHelp.getAsLoadedPageData(MED_ORDERS_PAGE_KEY)
    let pageTable = pageData.table
    let list = pageTable.map(order => new MedOrder(order))
    return list
  }

  /**
   * Get the MAR page current data
   * @return {*}
   */
  getEhrData_MarPageData () {
    return this.ehrHelp.getAsLoadedPageData(MAR_PAGE_KEY)
  }

  /**
   * Get the MAR records. This is an array of records inside the main MAR page data
   * @return {*|Array}
   */
  getEhrData_MarRecords () {
    let marTableKey = this.getMarTableKey()
    let raw = this.getEhrData_MarPageData()[marTableKey] || []
    let records = raw.map( m => new MarEntity(m))
    records.sort( (a,b) => MarEntity.compare(a, b) )
    return records
  }

  /**
   * Get the MAR page definition
   * @return {*}
   */
  getPageDef_Mar () {
    return this.ehrHelp.getPageDefinition(MAR_PAGE_KEY)
  }

  /**
   * Get the property key, within the MAR page definition, that contains the MAR records
   * @return {*}
   */
  getMarTableKey () {
    let key
    try {
      let marsPageDef = this.getPageDef_Mar()
      let table = marsPageDef.tables[0]
      key = table.tableKey
    } catch (err) {
      setApiError(err)
    }
    return key
  }

  //
  // marAndSchedule ( marRecords, periodDefs) {
  //   function compareTime( t1, t2 ) {
  //     let p1 = t1.split(':')
  //   }
  //   marRecords.sort( (a,b) => {
  //     let day = a.day - b.day
  //     let time = a.actualTime - b
  //   })
  //   marRecords.forEach(record => {
  //     // record.period is the schedule 'key'
  //     let periodKey = record.period
  //     Object.keys(periodDefs).forEach(pk => {
  //       let period = periodDefs[pk]
  //       let key = period.key
  //       if (key === periodKey) {
  //         period.marRecord = record
  //         period.hasMar = true
  //       }
  //     })
  //   })
  // }


  /**
   * Given a medication record create an object to insert into the database.
   * See @saveMarDialog
   * @param med
   */
  medRecord (med) {
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
  }

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

  /**
   * Dialog validation for the MAR record dialog.  Expect input to contain properties:
   * - who : string name of person who administers the medication
   * - when : 24 hour clock time, optional leading 0.  0:00 === 0:00
   * 0:00 to 23:59 is valid
   * @param aMar
   * @return {Array}
   */
  validateInputs (aMar) {
    return Mar.validateInputs(aMar)
  }

  /**
   * Create a complete MAR and save to the MAR page data.
   * @param aMar Assumes the MAR record as given has been validated
   * @param currentDay  a 'day' in the sense of the EdEHR. I.e. a number 0, 1, 2, ...
   * @param activePeriod Object { key : {type: String}, medsList: {type: Array of medRecord}}
   * @return {*}
   */
  saveMarDialog (aMarEntity) {
    let marTableKey = this.getMarTableKey()
    let asLoadedPageData = this.getEhrData_MarPageData()
    let table = asLoadedPageData[marTableKey] || []
    let aMar = aMarEntity.data
    console.log('saveMarDialog key:', marTableKey, ', ', aMar)
    table.push(aMar)
    let payload = {
      propertyName: MAR_PAGE_KEY,
      value: asLoadedPageData
    }
    return this.ehrHelp._saveData(payload)
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