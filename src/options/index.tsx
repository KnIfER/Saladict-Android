import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { getDefaultConfig, AppConfig } from '@/app-config'
import { getDefaultProfile, Profile, ProfileIDList } from '@/app-config/profiles'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import {
  getActiveProfile,
  addActiveProfileListener,
  getProfileIDList,
  addProfileIDListListener,
} from '@/_helpers/profile-manager'

import { I18nextProvider as ProviderI18next } from 'react-i18next'
import i18nLoader from '@/_helpers/i18n'
import commonLocles from '@/_locales/common'
import dictsLocles from '@/_locales/dicts'
import optionsLocles from '@/_locales/options'
import profileLocles from '@/_locales/config-profiles'

import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'

import './_style.scss'

window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_OPTIONS_PAGE__ = true
window.__SALADICT_LAST_SEARCH__ = ''

const i18n = i18nLoader({
  common: commonLocles,
  opt: optionsLocles,
  dict: dictsLocles,
  profile: profileLocles,
}, 'opt')

const antdLocales = {
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
  en: en_US,
}

export interface OptionsProps {
}

export interface OptionsState {
  config: AppConfig
  profile: Profile
  profileIDList: ProfileIDList
  rawProfileName: string
}

export class Options extends React.Component<OptionsProps, OptionsState> {
  state: OptionsState = {
    config: getDefaultConfig(),
    profile: getDefaultProfile(),
    profileIDList: [],
    rawProfileName: '',
  }

  getActiveProfileName = (
    activeID: string,
    profileIDList = this.state.profileIDList,
  ): string => {
    const activeProfileID = profileIDList.find(
      ({ id }) => id === activeID
    )
    return activeProfileID ? activeProfileID.name : ''
  }

  componentDidMount () {
    Promise.all([getConfig(), getActiveProfile(), getProfileIDList()])
      .then(async ([ config, profile, profileIDList ]) => {
        this.setState({
          config,
          profile,
          profileIDList,
          rawProfileName: this.getActiveProfileName(profile.id, profileIDList),
        })
      })

    addConfigListener(({ newConfig }) => {
      this.setState({ config: newConfig })
      //message.destroy()
      //message.success(i18n.t('msg_updated'))
      //message.success(i18n.t('msg_updated'))
      console.log(i18n.t('msg_updated'));
    })

    addActiveProfileListener(({ newProfile }) => {
      this.setState({
        profile: newProfile,
        rawProfileName: this.getActiveProfileName(newProfile.id),
      })
      //message.destroy()
      //message.success(i18n.t('msg_updated'))
      console.log(i18n.t('msg_updated'));
    })

    addProfileIDListListener(({ newValue }) => {
      this.setState({ profileIDList: newValue })
      //message.destroy()
      //message.success(i18n.t('msg_updated'))
      console.log(i18n.t('msg_updated'));
    })
  }

  render () {
    //<ProviderAntdLocale locale={antdLocales[this.state.config.langCode] || zh_CN}>
    //  {React.createElement(App, { ...this.state })}
    //</ProviderAntdLocale>
    return (
      <ProviderI18next i18n={i18n}>
        
        {React.createElement(App, { ...this.state })}

      </ ProviderI18next>
    )
  }
}

if (process.env.NODE_ENV !== 'development') {
  ReactDOM.render(<Options />, document.getElementById('root'))
}
