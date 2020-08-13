import pako from 'pako'
import { getDefaultConfig, AppConfig, fetchAllDicts as fetchAllDicts } from '@/app-config'
import { mergeConfig } from '@/app-config/merge-config'
import { storage } from './browser-api'

import { Observable } from 'rxjs/Observable'
import { from } from 'rxjs/observable/from'
import { concat } from 'rxjs/observable/concat'
import { map } from 'rxjs/operators/map'
import { fromEventPattern } from 'rxjs/observable/fromEventPattern'

export interface StorageChanged<T> {
  newValue: T,
  oldValue?: T,
}

export interface AppConfigChanged {
  newConfig: AppConfig,
  oldConfig?: AppConfig,
}

/** Compressed config data */
interface AppConfigCompressed {
  /** version */
  v: 1
  /** data */
  d: string
}

function deflate (config: AppConfig): AppConfigCompressed {
  return {
    v: 1,
    d: pako.deflate(JSON.stringify(config), { to: 'string' })
  }
}

(browser as any).unZip = function(e) {
  return JSON.parse(pako.inflate(e, { to: 'string' }))
}

function inflate (config: AppConfig | AppConfigCompressed): AppConfig
function inflate (config: undefined): undefined
function inflate (config?: AppConfig | AppConfigCompressed): AppConfig | undefined
function inflate (config?: AppConfig | AppConfigCompressed): AppConfig | undefined {
  if (config && config['v'] === 1) {
    console.log('inflate', pako.inflate((config as AppConfigCompressed).d, { to: 'string' }));
    return JSON.parse(pako.inflate((config as AppConfigCompressed).d, { to: 'string' }))
  }
  return config as AppConfig
}

export async function loadAlloySalad () {
  let cm=(browser as any)
  if(!cm.UTEX) {
    let json = await fetch('/ALLOYD'
    //, { mode:'no-cors' }
    )
    .then(res => res.json())
    .catch((): any => (
      //{result: { }}
      null
    ))
    console.log("内聚外合", json);
    cm.UTEX = json
    browser.dictAll=null
    fetchAllDicts()
    return json
  }
}

export async function initConfig (): Promise<AppConfig> {
  console.log('initConfig...')

  let baseconfig = await getConfig()

  baseconfig = baseconfig && baseconfig.version
    ? mergeConfig(baseconfig)
    : getDefaultConfig()

  await updateConfig(baseconfig)
  return baseconfig
}

export async function resetConfig () {
  const baseconfig = getDefaultConfig()
  await updateConfig(baseconfig)
  return baseconfig
}

export async function getConfig (): Promise<AppConfig> {
  let hey = await loadAlloySalad()
  console.log('getConfig???', hey)
  
  const { baseconfig } = await storage.sync.get<{
    baseconfig: AppConfig
  }>('baseconfig')
  return inflate(baseconfig || getDefaultConfig())
}

export function updateConfig (baseconfig: AppConfig): Promise<void> {
  return storage.sync.set({ baseconfig: deflate(baseconfig) })
}

/**
 * Listen to config changes
 */
export async function addConfigListener (
  cb: (changes: AppConfigChanged) => any
) {
  storage.sync.addListener(changes => {
    if (changes.baseconfig) {
      const {
        newValue,
        oldValue,
      } = (changes as { baseconfig: StorageChanged<AppConfigCompressed> }).baseconfig
      if (newValue) {
        cb({ newConfig: inflate(newValue), oldConfig: inflate(oldValue) })
      }
    }
  })
}

/**
 * Get config and create a stream listening to config change
 */
export function createConfigStream (): Observable<AppConfig> {
  return concat(
    from(getConfig()),
    fromEventPattern<[AppConfigChanged] | AppConfigChanged>(addConfigListener as any).pipe(
      map(args => (Array.isArray(args) ? args[0] : args).newConfig),
    ),
  )
}
