import { useNow, useDateFormat } from '@vueuse/core'
// import { v4 as uuid } from 'uuid'
import { nanoid } from 'nanoid';
import { BackgroundColors, State } from './constants'
   
export const requiredRule = [ v => !!v || 'Required' ]
export const minRule      = [ v => v.length >= 6 || 'Min 6 characters' ]
export const emailRule    = [ v => !!v || 'Required',
   v => /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'E-mail not valid',
]
export const optionalYearRule = [ v => isOptionalYear(v) ]
const isOptionalYear = (v) => { 
   return !v || parseInt(v) && v > 1800 && v <= new Date().getFullYear() ? true : 'Invalid year' 
}

export function dateUuid() {
   const datePrefix = useDateFormat(useNow(), 'YYMMDD-')
   let id = nanoid()
   id = id.replaceAll("_", "")
   if (id.endsWith("-")) { id = id.slice(0, -1) }
   return datePrefix.value + id

   // const datePrefix = useDateFormat(useNow(), 'MM-DD-YY-')
   // return datePrefix.value + uuid()
}
         
export function logError(viewName, err, instance) { 
   if (err.message == "img is null" && instance.$options.name == "BaseTransition") { return false }
   
   console.log(viewName + " error: " + err.message + ", instance: " + instance.$options.name)
   return false // do not bubble up error
}

export function randomPlate() { return random3('ABCDEFGHIJKLMNOPQRSTUVWXYZ') + random3('1234567890') }
function random3(chars) {
    var result = ''
    for (var i=0; i<3; i++) { result += chars[Math.floor(Math.random() * chars.length)] }
    return result
}

export function thumbBackgroundColorStyle(obj) { return isPrivate(obj) || isGroup(obj) ? backgroundColorStyle(obj.state) : "" }
export function backgroundColorStyle(state) { return "background-color: " + backgroundColorCode(state) }
export function backgroundColorCode(state) {
   if (state == State.PUBLIC)         { return BackgroundColors.GREEN.code }
   else if (state == State.PRIVATE)   { return BackgroundColors.RED.code }
   else if (state == State.GROUP)     { return BackgroundColors.YELLOW.code }
   
   return BackgroundColors.WHITE.code
}

export function removeArrayEntry(array, entry) { 
   const index = array.indexOf(entry)
   if (index > -1) { array.splice(index, 1) }
}

export const IdSet = class {
   constructor() { this.set = new Set }
   has(id) { return this.set.has(id) }
   addId(id) { this.set.add(id) }
   addIds(ids) { for (const id of ids) { this.set.add(id) } }
   asArray() { return [ ...this.set ] }
}

export function isPublic(obj)    { return obj && obj.state == State.PUBLIC  }
export function isPrivate(obj)   { return obj && obj.state == State.PRIVATE }
export function isGroup(obj)     { return obj && obj.state == State.GROUP }
export function isHidden(obj)    { return obj && obj.state == State.HIDDEN  }
export function isOwned(obj, userId) { return obj && userId && obj.userId == userId }   

export function objAspectRatio(object) { return object.width / object.height }
   
export function sortByName(objs) {
   const sortedObjs = [ ...objs ]
   sortedObjs.sort((a, b) => a.name.localeCompare(b.name))
   return sortedObjs
}

export function randomizeArray(array) {
   return !array || !array.length ? array : 
      array
         .map(value => ({ value, sort: Math.random() }))
         .sort((a, b) => a.sort - b.sort)
         .map(({ value }) => value)
}

export function getMapObjsById(id, map) { return map && map.has(id) ? map.get(id) : [] }

export function populated(str) { return str && str.length }
export function possessive(str) { return populated(str) ? str + (str.endsWith("s") ? "'" : "'s") : ""}

// toSorted breaks old safari - use [...objs].sort
export function toSortedNameAsc(objs)         { return objs?.length ? [...objs].sort((a, b) => a.name.localeCompare(b.name)): objs }
export function toSortedUsernameAsc(objs)     { return objs?.length ? [...objs].sort((a, b) => a.username.localeCompare(b.username)) : objs }
export function toSortedSortDesc(objs)        { return objs?.length ? [...objs].sort((a, b) => b.sort - a.sort) : objs }

// inefficient - should add millis to obj - then just one milli call per object
// will begin to matter with items, hits
export function toSortedDateCreatedAsc(objs)  { return objs?.length ? [...objs].sort((a, b) => millis(a.dateCreated) - millis(b.dateCreated)) : objs }
export function toSortedDateCreatedDesc(objs) { return objs?.length ? [...objs].sort((a, b) => millis(b.dateCreated) - millis(a.dateCreated)) : objs }
export function toSortedDateViewedAsc(objs)   { return objs?.length ? [...objs].sort((a, b) => millis(a.dateViewed)  - millis(b.dateViewed))  : objs }
export function toSortedDateViewedDesc(objs)  { return objs?.length ? [...objs].sort((a, b) => millis(b.dateViewed)  - millis(a.dateViewed))  : objs }
export function toSortedDateModifiedDesc(objs)        { return objs?.length ? [...objs].sort((a, b) => millis(b.dateModified) - millis(a.dateModified)) : objs }
export function toSortedDateContentModifiedDesc(objs) { return objs?.length ? [...objs].sort((a, b) => millis(b.dateContentModified) - millis(a.dateContentModified)) : objs }

// universal conversion of firestre date to millis - needed for ion ios
function millis(timestamp) {
  if (!timestamp) { return 0 }
  
  // 1. Native iOS / Capacitor serialized timestamp
  if (typeof timestamp === 'object' && ('seconds' in timestamp || '_seconds' in timestamp)) {
    const sec  = timestamp.seconds     ?? timestamp._seconds     ?? 0
    const nano = timestamp.nanoseconds ?? timestamp._nanoseconds ?? 0
    return sec * 1000 + Math.floor(nano / 1e6);
  }
  
  // 2. JS SDK Firestore Timestamp instance
  if (typeof timestamp.toMillis === 'function') { return timestamp.toMillis() }

  return 0
}

const KNOWN_ERRORS = [ " is null", ".value is undefined" ]
export function handleError(err, component) { 
   // for (const suffix of KNOWN_ERRORS) {
   //    if (err.message.endsWith(suffix)) { 
   //       console.log(component + " known error: " + err.name + " - " + err.message)
   //       return false // do not bubble up error
   //    }
   // } 
   return true
}
