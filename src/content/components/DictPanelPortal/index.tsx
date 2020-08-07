import React from 'react'
import ReactDOM from 'react-dom'
import CSSTransition from 'react-transition-group/CSSTransition'
import { DictID } from '@/app-config'
import memoizeOne from 'memoize-one'
import DictPanel, { DictPanelDispatchers, DictPanelProps } from '../DictPanel'
import { Omit } from '@/typings/helpers'
import PortalFrame from '@/components/PortalFrame'
import { injectAnalytics } from '@/_helpers/analytics'

const isSaladictInternalPage = !!window.__SALADICT_INTERNAL_PAGE__
const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__
const isSaladictQuickSearchPage = !!window.__SALADICT_QUICK_SEARCH_PAGE__

const isStandalonePage = isSaladictPopupPage || isSaladictQuickSearchPage

const getDictStyles = memoizeOne((selected: DictID[]): string => {
  return selected.map(
    id => `<link rel="stylesheet" href="${browser._URL(`/dicts/${isSaladictInternalPage ? 'internal/' : ''}${id}.css`)}" />`
  ).join('\n')
})

export type DictPanelPortalDispatchers = DictPanelDispatchers

export type ChildrenProps =
  DictPanelPortalDispatchers &
  Omit<
    DictPanelProps,
    'panelWidth'
  >

export interface DictPanelPortalProps extends ChildrenProps {
  readonly isAnimation: boolean
  readonly panelCSS: string
  readonly shouldPanelShow: boolean
  readonly panelRect: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface DictPanelState {
  readonly isDragging: boolean
}

export default class DictPanelPortal extends React.Component<DictPanelPortalProps, DictPanelState> {
  isMount = false
  root = isStandalonePage
    ? document.getElementById('frame-root') as HTMLDivElement
    : document.body
  el = document.createElement('div')
  /** background layer when dragging to prevent event losing */
  dragBg = document.createElement('div')
  frame: HTMLIFrameElement | null = null
  lastMouseX = 0
  lastMouseY = 0
  /** iframe head */
  frameHead: string

  state: DictPanelState = {
    isDragging: false,
  }

  constructor (props: DictPanelPortalProps) {
    super(props)
    this.el.className = 'alloydict-DIV'
    this.dragBg.className = 'alloydict-DragBg'

    const meta = '<meta name="viewport" content="width=device-width, initial-scale=1">\n'

    if (process.env.NODE_ENV === 'production') {
      // load panel style and selected dict styles
      // this will reduce the initial loading time
      this.frameHead = (
        meta +
        `<link type="text/css" rel="stylesheet" href="${browser._URL('panel.css')}" />\n`
      )
    } else {
      const styles = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
        .map(link => link.outerHTML)
        .join('\n')

      // remove wordEditor style
      this.frameHead = meta + styles + `
        <script>
          document.querySelectorAll('link')
            .forEach(link => {
              return fetch(link.href)
                .then(r => r.blob())
                .then(b => {
                  var reader = new FileReader();
                  reader.onload = function() {
                    if (reader.result.indexOf('wordEditor') !== -1) {
                      link.remove()
                    }
                  }
                  reader.readAsText(b)
                })
            })
        </script>
        `
    }
  }

  mountEL = () => {
    // body could be replaced by other scripts
    if (!isStandalonePage) { this.root = document.body }
    this.root.appendChild(this.el)
    this.isMount = true
  }

  unmountEL = () => {
    this.frame = null
    // body could be replaced by other scripts
    if (!isStandalonePage) { this.root = document.body }
    this.root.removeChild(this.el)
    this.isMount = false
  }

  handleFrameKeyUp = ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
    if (key === 'Escape') {
      this.props.closePanel()
    }
  }

  handlePanelEnter = (node: HTMLElement) => {
    this.frame = node as HTMLIFrameElement

    if (!isStandalonePage) {
      const { x, y, width, height } = this.props.panelRect
      const style = node.style

      style.setProperty('left', `${x}px`, 'important')
      style.setProperty('top', `${y}px`, 'important')
      style.setProperty('width', width + 'px', 'important')
      style.setProperty('height', height + 'px', 'important')

      if (isSaladictOptionsPage) {
        // under antd modal mask
        style.setProperty('z-index', '900', 'important')
      }
    }

    if (this.frame.contentWindow) {
      this.frame.contentWindow.document.title = isSaladictQuickSearchPage
        ? 'Saladict Quick Search Panel'
        : 'Saladict Panel'
      injectAnalytics(
        isSaladictQuickSearchPage ? '/qspanel' : '/panel',
        this.frame.contentWindow,
      )
    }
  }

  frameDidMount (iframe: HTMLIFrameElement) {
    if (process.env.NODE_ENV === 'production') {
      const doc = iframe.contentDocument
      if (doc && doc.head && !doc.head.innerHTML.includes('panel.css')) {
        const $link = doc.createElement('link')
        $link.type = 'text/css'
        $link.rel = 'stylesheet'
        $link.href = browser._URL('panel.css')
        doc.head.appendChild($link)
      }
    }
  }

  componentDidUpdate () {
    if (!this.frame) { return }

    const { style } = this.frame

    if (!isStandalonePage) {
      const { x, y, width, height } = this.props.panelRect
      style.setProperty('left', `${x}px`, 'important')
      style.setProperty('top', `${y}px`, 'important')
      style.setProperty('width', width + 'px', 'important')
      style.setProperty('height', height + 'px', 'important')
    }
  }

  renderDictPanel = () => {
    const {
      isAnimation,
      panelCSS,
      dictsConfig,
    } = this.props

    const {
      isDragging,
    } = this.state

    const frameClassName = 'alloydict-DictPanel'
      + (isAnimation ? ' isAnimate' : '')
      + (isDragging ? ' isDragging' : '')

    return (
      isSaladictInternalPage
        ? <div className={'panel-StyleRoot ' + frameClassName}>
            <DictPanel
              {...this.props}
              panelWidth={this.props.panelRect.width}
            />
          </div>
        : <PortalFrame
            className={frameClassName}
            bodyClassName='panel-FrameBody'
            name='alloydict-dictpanel'
            frameBorder='0'
            head={`${this.frameHead}\n${getDictStyles(dictsConfig.selected)}\n<style>${panelCSS}</style>\n`}
            frameDidMount={this.frameDidMount}
          >
            <DictPanel
              {...this.props}
              panelWidth={this.props.panelRect.width}
            />
          </PortalFrame>
    )
  }

  render () {
    const {
      shouldPanelShow,
    } = this.props

    const {
      isDragging,
    } = this.state

    if (shouldPanelShow && !this.isMount) {
      this.mountEL()
    }

    return ReactDOM.createPortal(
      <div
        className='alloydict-DIV'
        onKeyUp={this.handleFrameKeyUp}
      >
        <CSSTransition
          classNames='alloydict-DictPanel'
          in={shouldPanelShow}
          timeout={500}
          mountOnEnter={true}
          unmountOnExit={true}
          appear={isSaladictOptionsPage || isStandalonePage}
          onEnter={this.handlePanelEnter}
          onEntered={this.handlePanelEnter}
          onExited={this.unmountEL}
        >
          {this.renderDictPanel}
        </CSSTransition>
      </div>,
      this.el,
    )
  }
}
