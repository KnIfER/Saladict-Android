import { getDefaultConfig, AppConfig, AppConfigMutable } from '@/app-config'

import forEach from 'lodash/forEach'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import get from 'lodash/get'
import set from 'lodash/set'

export default mergeConfig

export function mergeConfig (oldConfig: AppConfig, baseConfig?: AppConfig): AppConfig {
  const base: AppConfigMutable = baseConfig
    ? JSON.parse(JSON.stringify(baseConfig))
    : getDefaultConfig()

  console.log('mergeConfig', oldConfig, baseConfig)

  // pre-merge patch start
  let oldVersion = oldConfig.version

  // pre-merge patch end

  mergeBoolean('animation')

  merge('langCode', val => /^(zh-CN|zh-TW|en)$/.test(val))

  mergeNumber('panelWidth')
  mergeNumber('panelMaxHeightRatio')
  mergeString('panelCSS')
  mergeNumber('fontSize')
  mergeBoolean('searhHistory')
  mergeBoolean('searhHistoryInco')
  mergeBoolean('newWordSound')
  mergeBoolean('editOnFav')
  mergeBoolean('searchSuggests')

  merge('baPreload', val => val === '' || val === 'clipboard' || val === 'selection')
  mergeBoolean('baAuto')
  mergeString('baOpen')

  forEach(base.ctxTrans, (value, id) => {
    mergeBoolean(`ctxTrans.${id}`)
  })

  // merge('autopron.cn.dict', id => defaultAllDicts[id])
  // merge('autopron.en.dict', id => defaultAllDicts[id])

  merge('autopron.en.accent', val => val === 'us' || val === 'uk')

  merge('whiltelist', val => Array.isArray(val))
  merge('blacklist', val => Array.isArray(val))

  if (oldVersion <= 11) {
    oldVersion = 12
    base.blacklist.push(
      ['^https://stackedit\.io(/.*)?$', 'https://stackedit.io/*']
    )
  }

  if (base.panelMaxHeightRatio < 1) {
    base.panelMaxHeightRatio = Math.round(base.panelMaxHeightRatio * 100)
  }
  // post-merge patch end

  return base

  function mergeNumber (path: string): void {
    return merge(path, isNumber)
  }

  function mergeString (path: string): void {
    return merge(path, isString)
  }

  function mergeBoolean (path: string): void {
    return merge(path, isBoolean)
  }

  function merge (path: string, predicate: (val) => boolean): void {
    const val = get(oldConfig, path)
    if (predicate(val)) {
      set(base, path, val)
    }
  }
}
