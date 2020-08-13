import React from 'react'
import { DictID } from '@/app-config'
import { TranslationFunction } from 'i18next'
import LangCodeList from './LangCodeList'

interface DictTitleProps {
  t: TranslationFunction
  dictID: DictID
  lang: string
  UTX: any
}

const iconStyle: React.CSSProperties = {
  width: '1.3em',
  height: '1.3em',
  marginRight: 5,
  verticalAlign: 'text-bottom',
}

export default class DictTitle extends React.PureComponent<DictTitleProps> {
  render () {
    const { t, dictID, lang, UTX } = this.props
    console.log('UTX', UTX)
    const title = t(`dict:${dictID}`)
    return (
      <span>
        <img
          style={iconStyle}
          src={UTX?('/'+dictID+'/favicon.png'):require('@/components/dictionaries/' + dictID + '/favicon.png')}
          alt={UTX?UTX.title:`logo ${title}`}
        />
        {UTX?UTX.title:title}
        <LangCodeList t={t} langs={lang} />
      </span>
    )
  }
}
