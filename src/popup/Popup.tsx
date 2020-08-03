import React from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'
import { AppConfig } from '@/app-config'
import { updateConfig } from '@/_helpers/config-manager'
import { message } from '@/_helpers/browser-api'
import {
  MsgType,
  MsgQueryPanelState,
  MsgTempDisabledState,
} from '@/typings/message'

interface PopupProps {
  config: AppConfig
}

interface PopupState {
  currentTabUrl: string
  isShowUrlBox: boolean
  tempOff: boolean
  showPageNoResponse: boolean
  insCapMode: 'mode' | 'pinMode'
}

export class Popup extends React.Component<PopupProps & { t: TranslationFunction }, PopupState> {
  state: PopupState = {
    currentTabUrl: '',
    isShowUrlBox: false,
    tempOff: false,
    showPageNoResponse: false,
    insCapMode: 'mode' as 'mode' | 'pinMode',
  }

  activeContainer = () => {
    const $frameRoot = document.querySelector<HTMLDivElement>('#frame-root')
    if ($frameRoot) {
      $frameRoot.style.height = '400px'
    }
  }

  hideContainer = () => {
    const $frameRoot = document.querySelector<HTMLDivElement>('#frame-root')
    if ($frameRoot) {
      $frameRoot.style.height = '500px'
      this.setState({ currentTabUrl: '' })
    }
  }

  changeTempOff = () => {
    const oldTempOff = this.state.tempOff
    const newTempOff = !oldTempOff

    this.setState({ tempOff: newTempOff })

    browser.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        if (tabs.length > 0 && tabs[0].id != null) {
          return message.send<MsgTempDisabledState>(
            tabs[0].id as number,
            {
              type: MsgType.TempDisabledState,
              op: 'set',
              value: newTempOff,
            },
          )
        }
      })
      .then(isSuccess => {
        if (!isSuccess) {
          this.setState({ tempOff: oldTempOff })
          return Promise.reject(new Error('Set tempOff failed')) as any
        }
      })
      .catch(() => this.setState({ showPageNoResponse: true }))
  }

  changeInsCap = () => {
    const { config } = this.props
    const { insCapMode } = this.state
    const newConfig: AppConfig = {
      ...config,
      [insCapMode]: {
        ...config[insCapMode],
        instant: {
          ...config[insCapMode].instant,
          enable: !config[insCapMode].instant.enable
        }
      }
    }
    updateConfig(newConfig)
  }

  changeActive = () => {
    const { config } = this.props
    const newConfig = {
      ...config,
      active: !config.active
    }
    updateConfig(newConfig)
  }

  clearCurrentTabUrl = () => {
    this.setState({ currentTabUrl: '' })
  }

  componentDidMount () {
    browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].id != null) {
        message.send<MsgTempDisabledState>(
          tabs[0].id as number,
          {
            type: MsgType.TempDisabledState,
            op: 'get',
          },
        ).then(flag => {
          this.setState({ tempOff: flag })
        })

        message.send<MsgQueryPanelState, boolean>(
          tabs[0].id as number,
          {
            type: MsgType.QueryPanelState,
            path: 'widget.isPinned',
          },
        ).then(isPinned => {
          this.setState({ insCapMode: isPinned ? 'pinMode' : 'mode' })
        })
      }
    })
    .catch(err => console.warn('Error when receiving MsgTempDisabled response', err))
  }

  render () {
    const { t, config } = this.props
    const {
      currentTabUrl,
      tempOff,
      insCapMode,
    } = this.state

    return (
      <div
        className='switch-container'
        onMouseEnter={this.activeContainer}
        onMouseLeave={this.hideContainer}
      >
        <div className='active-switch'>
          <span className='switch-title'>{t('app_temp_active_title')}</span>
          <input
            type='checkbox'
            id='opt-temp-active'
            className='btn-switch'
            checked={tempOff}
            onClick={this.changeTempOff}
            onFocus={this.activeContainer}
          />
          <label htmlFor='opt-temp-active'></label>
        </div>
        <div className='active-switch'>
          <span className='switch-title'>{
            t('instant_capture_title') +
            (insCapMode === 'pinMode' ? t('instant_capture_pinned') : '')
          }</span>
          <input
            type='checkbox'
            id='opt-instant-capture'
            className='btn-switch'
            checked={config[insCapMode].instant.enable}
            onClick={this.changeInsCap}
            onFocus={this.activeContainer}
          />
          <label htmlFor='opt-instant-capture'></label>
        </div>
        <div className='active-switch'>
          <span className='switch-title'>{t('app_active_title')}</span>
          <input
            type='checkbox'
            id='opt-active'
            className='btn-switch'
            checked={config.active}
            onClick={this.changeActive}
            onFocus={this.activeContainer}
          />
          <label htmlFor='opt-active'></label>
        </div>
      </div>
    )
  }
}

export default translate()(Popup)
