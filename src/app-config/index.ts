import { DeepReadonly } from '@/typings/helpers'
import { getALlDicts } from './dicts'
import { MtaAutoUnfold as _MtaAutoUnfold, _getDefaultProfile } from './profiles'

export type LangCode = 'zh-CN' | 'zh-TW' | 'en'

const langUI = (browser._Language() || 'en')
const langCode: LangCode = /^zh-CN|zh-TW|en$/.test(langUI)
  ? langUI === 'zh-HK'
    ? 'zh-TW'
    : langUI as LangCode
  : 'en'

export type DictConfigsMutable = ReturnType<typeof getALlDicts>
export type DictConfigs = DeepReadonly<DictConfigsMutable>
export type DictID = keyof DictConfigsMutable
export type MtaAutoUnfold = _MtaAutoUnfold

/** '' means no preload */
export type PreloadSource = '' | 'clipboard' | 'selection'

export type AllDicts = ReturnType<typeof getALlDicts>

export type AppConfigMutable = ReturnType<typeof _getDefaultConfig>
export type AppConfig = DeepReadonly<AppConfigMutable>

export const getDefaultConfig: () => AppConfig = _getDefaultConfig
export default getDefaultConfig

export function fetchAllDicts () {
  if(!browser.dictAll) {
    browser.dictAll = getALlDicts()
  }
  return browser.dictAll;
}

function _getDefaultConfig () {
  return {
    version: 12,

    /** use animation for transition */
    animation: true,

    /** language code for locales */
    langCode,

    /** panel width */
    panelWidth: 450,

    /** panel max height in percentage, 0 < n < 100 */
    panelMaxHeightRatio: 80,

    /** custom panel css */
    panelCSS: '',

    /** panel font-size */
    fontSize: 13,

    /** track search history */
    searhHistory: false,
    /** incognito mode */
    searhHistoryInco: false,

    /** open word editor when adding a word to notebook */
    editOnFav: true,

    /** Show suggestions when typing on search box */
    searchSuggests: true,

    /** browser action panel preload source */
    baPreload: 'clipboard' as PreloadSource,

    /** auto search when browser action panel shows */
    baAuto: false,

    /**
     * browser action behavior
     * 'popup_panel' - show dict panel
     * 'popup_fav' - add selection to notebook
     * 'popup_options' - opten options
     * others are same as context menus
     */
    baOpen: 'popup_panel',

    /** context tranlate engines */
    ctxTrans: {
      google: true,
      tencent: false,
      sogou: false,
      baidu: false,
    } as { [id in DictID]: boolean },

    /** auto pronunciation */
    autopron: {
      cn: {
        dict: '' as DictID | '',
        list: ['zdic', 'guoyu'] as DictID[]
      },
      en: {
        dict: '' as DictID | '',
        list: [
          'bing',
          'cambridge',
          'cobuild',
          'eudic',
          'longman',
          'macmillan',
          'oald',
          'urban',
          'websterlearner',
          'youdao',
        ] as DictID[],
        accent: 'uk' as 'us' | 'uk'
      },
      machine: {
        dict: '' as DictID | '',
        list: [
          'google',
          'sogou',
          'tencent',
          'baidu',
          'caiyun',
        ],
        // play translation or source
        src: 'trans' as 'trans' | 'searchText',
      }
    },

    /** URLs, [regexp.source, match_pattern] */
    whitelist: [] as [string, string][],
    /** URLs, [regexp.source, match_pattern] */
    // tslint:disable-next-line: no-unnecessary-type-assertion
    blacklist: [
      ['^https://stackedit\.io(/.*)?$', 'https://stackedit.io/*']
    ] as [string, string][]
  }
}
