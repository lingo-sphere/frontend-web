'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'
const eventName = 'writing-review-draft-change'
/** Device-local draft, scoped by account and review session. Never store tokens or answers from another account. */
export function useWritingReviewDraft(key: string | null) {
 const [storageFailed,setStorageFailed] = useState(false)
 const subscribe = useCallback((callback: () => void) => {
  window.addEventListener('storage',callback); window.addEventListener(eventName,callback)
  return () => { window.removeEventListener('storage',callback);window.removeEventListener(eventName,callback) }
 },[])
 const getSnapshot = useCallback(() => { if(!key) return '';try{return localStorage.getItem(key) || ''}catch{return ''} },[key])
 const content = useSyncExternalStore(subscribe,getSnapshot,()=>'')
 const save = useCallback((value: string) => {
  if(!key) return true
  try{localStorage.setItem(key,value);window.dispatchEvent(new Event(eventName));setStorageFailed(false);return true}
  catch{setStorageFailed(true);return false}
 },[key])
 const clear = useCallback(() => {if(!key)return;try{localStorage.removeItem(key);window.dispatchEvent(new Event(eventName))}catch{/* Keep the successful submission usable even when storage is unavailable. */}},[key])
 return {content,save,clear,storageFailed}
}
