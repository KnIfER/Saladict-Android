import { RawLocale, RawLocales } from '@/_helpers/i18n'
import { fetchAllDicts } from '@/app-config'

export interface RawDictLocales {
  name: RawLocale
  options?: RawLocales
  helps?: RawLocale
}

var allDicts=fetchAllDicts();

export const dictsLocales: RawLocales = Object.keys(allDicts)
  .reduce((result, id) => {
    //console.log('dictsLocales', allDicts[id])
    var iden=allDicts[id].TEST;
    iden = iden?iden.type:id
    const locale: RawDictLocales = require('@/components/dictionaries/' + iden + '/_locales')
    result[id] = locale.name
    const options = locale.options
    if (options) {
      Object.keys(options).forEach(opt => {
        result[`${id}_${opt}`] = options[opt]
      })
    }

    const helps = locale.helps
    if (helps) {
      Object.keys(helps).forEach(opt => {
        result[`${id}_h_${opt}`] = helps[opt]
      })
    }

    return result
  }, {})

export default dictsLocales
