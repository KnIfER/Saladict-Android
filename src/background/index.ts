import './server'
import './initialization'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import { getActiveProfile, addActiveProfileListener } from '@/_helpers/profile-manager'
import { startSyncServiceInterval } from './sync-manager'
import './types'

console.log('HAHAHA', browser);

if(browser.isPlugin) {
  browser.browserAction.setBadgeBackgroundColor({ color: '#C0392B' })
}

startSyncServiceInterval()

getConfig().then(async config => {
  window.appConfig = config

  addConfigListener(({ newConfig }) => {
    window.appConfig = newConfig
  })
})

getActiveProfile().then(async profile => {
  window.activeProfile = profile

  addActiveProfileListener(({ newProfile }) => {
    window.activeProfile = newProfile
  })
})
