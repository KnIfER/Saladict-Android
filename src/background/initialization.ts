import { storage, openURL } from '@/_helpers/browser-api'
import { initConfig } from '@/_helpers/config-manager'
import { initProfiles } from '@/_helpers/profile-manager'
import { openQSPanel } from './server'
import './types'

if(browser.isPlugin) {
  browser.runtime.onInstalled.addListener(onInstalled)
  browser.browserAction.onClicked.addListener(function(){
    console.log('111');
    openQSPanel ();
    console.log('222');
  });
} else {
  onInstalled(null);
}


async function onInstalled (e) {
  window.appConfig = await initConfig()
  window.activeProfile = await initProfiles()

  if(e) {
    const { reason } = e;
    if (reason === 'install') {
      if (!(await storage.sync.get('hasInstructionsShown')).hasInstructionsShown) {
        openURL('https://github.com/crimx/ext-saladict/wiki/Instructions#wiki-content')
        storage.sync.set({ hasInstructionsShown: true })
      }
      (await browser.tabs.query({})).forEach(tab => {
        if (tab.id) {
          browser.tabs.executeScript(tab.id, { file: '/content.js' }).catch(() => {/**/})
          browser.tabs.insertCSS(tab.id, { file: '/content.css' }).catch(() => {/**/})
        }
      })
    } 
    //else if (reason === 'update') {}
  }
}