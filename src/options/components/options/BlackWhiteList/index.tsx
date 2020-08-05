import React from 'react'
import { Props } from '../typings'
import { formItemLayout } from '../helpers'
import MatchPatternModal from '../../MatchPatternModal'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Button } from 'antd'

export type BlackWhiteListProps = Props & FormComponentProps

interface BlackWhiteListState {
  editingArea: '' | 'whitelist' | 'blacklist'
}

export class BlackWhiteList extends React.Component<BlackWhiteListProps, BlackWhiteListState> {
  constructor (props: BlackWhiteListProps) {
    super(props)
    this.state = {
      editingArea: ''
    }
  }

  closeModal = () => {
    this.setState({ editingArea: '' })
  }

  render () {
    const { t, config } = this.props

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_sel_blackwhitelist')}
          help={t('opt_sel_blackwhitelist_help')}
        >
          <Button
            style={{ marginRight: 10 }}
            onClick={() => this.setState({ editingArea: 'blacklist' })}
          >{t('common:blacklist')}</Button>
          <Button
            onClick={() => this.setState({ editingArea: 'whitelist' })}
          >{t('common:whitelist')}</Button>
        </Form.Item>
        <MatchPatternModal
          t={t}
          config={config}
          area={this.state.editingArea}
          onClose={this.closeModal}
        />
      </Form>
    )
  }
}

export default BlackWhiteList
