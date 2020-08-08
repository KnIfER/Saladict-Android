import React from 'react'
import { translate, TranslationFunction } from 'react-i18next'

import './_style.scss'

interface OptMenuState {
  isShowAcknowledgement: boolean
  isShowSocial: boolean
  isShowDonate: boolean
}

export class OptMenu extends React.PureComponent<{ t: TranslationFunction }, OptMenuState> {

  render () {
    const { t } = this.props

    return (
      <ul className='head-info'>
        <li>
          <a
            href='https://github.com/crimx/ext-saladict/wiki#wiki-content'
            target='_blank'
            rel='nofollow noopener noreferrer'
          >{t('opt:About_Info')}</a>
        </li>
      </ul>
    )
  }
}

export default translate()(OptMenu)
