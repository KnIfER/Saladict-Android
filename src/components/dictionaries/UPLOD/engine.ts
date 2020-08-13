import { handleNoResult, handleNetWorkError, SearchFunction, GetSrcPageFunction } from '../helpers'
import { DictSearchResult } from '@/typings/server'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return ''
  //return `https://www.moedict.tw/${chsToChz(text)}`
}

/** @see https://github.com/audreyt/moedict-webkit#4-國語-a */
export interface UPLODResult {
  n: number
  /** Title */
  t: string
  html: string
}

export const search: SearchFunction<DictSearchResult<UPLODResult>> = (
  text, config, profile, payload
) => {
  var TEST = payload as any
 
  return fetch(TEST.host.replace('%s', text))
    .then(res => res.text())
    .catch(handleNetWorkError)
    .then<DictSearchResult<UPLODResult>>(data => {
      if (!data) { return handleNoResult() }

      //console.log('接收到：', data)

      var ret = {} as UPLODResult;
      ret.html = data
      ret.t = text

      const result: DictSearchResult<UPLODResult> = { result: ret }

      // data.h.forEach(h => {
      //   if (h['=']) {
      //     h['='] = `https://203146b5091e8f0aafda-15d41c68795720c6e932125f5ace0c70.ssl.cf1.rackcdn.com/${h['=']}.ogg`
      //   }
      //   if (!result.audio) {
      //     result.audio = {
      //       py: h['=']
      //     }
      //   }
      // })

      return result
    })
}