import { message } from '@/_helpers/browser-api'
import * as selection from '@/_helpers/selection'
import { Mutable } from '@/typings/helpers'
import { MsgType, PostMsgType, PostMsgSelection } from '@/typings/message'

import { lastMousedown$$, validMouseup$$, clickPeriodCount$ } from './mouse-events'
import {
  sendMessage,
  isEscapeKey,
  isKeyPressed,
  isInPanelOnInternalPage,
} from './helper'

import { map } from 'rxjs/operators/map'
import { take } from 'rxjs/operators/take'
import { filter } from 'rxjs/operators/filter'
import { withLatestFrom } from 'rxjs/operators/withLatestFrom'
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged'

const isSaladictInternalPage = !!window.__SALADICT_INTERNAL_PAGE__
const isSaladictOptionsPage = !!window.__SALADICT_OPTIONS_PAGE__
const isSaladictPopupPage = !!window.__SALADICT_POPUP_PAGE__
const isNoSelectionPage = isSaladictOptionsPage || isSaladictPopupPage

interface PostMessageEvent extends MessageEvent {
  data: PostMsgSelection
}

/**
 * Beware that this is run on every frame.
 */
message.addListener(msg => {
  switch (msg.type) {
    case MsgType.PreloadSelection:
      if (selection.getSelectionText()) {
        return Promise.resolve(selection.getSelectionInfo())
      }
      break
    case MsgType.EmitSelection:
      let isSent = false
      lastMousedown$$.pipe(take(1)).subscribe(lastMousedownEvent => {
        if (lastMousedownEvent) {
          const text = selection.getSelectionText()
          if (text) {
            const { clientX, clientY } = lastMousedownEvent instanceof MouseEvent
              ? lastMousedownEvent
              : lastMousedownEvent.changedTouches[0]
            sendMessage({
              mouseX: clientX,
              mouseY: clientY,
              instant: true,
              self: isSaladictInternalPage
                ? isInPanelOnInternalPage(lastMousedownEvent)
                : window.name === 'alloydict-dictpanel',
              selectionInfo: selection.getSelectionInfo({ text }),
            })
            isSent = true
          }
        }
      })
      // Only returns when there is a match, otherwise leave it to other frames.
      if (isSent) { return Promise.resolve() }
      break
    default:
      break
  }
})

/** Pass through message from iframes */
window.addEventListener('message', ({ data, source }: PostMessageEvent) => {
  if (data.type !== PostMsgType.Selection) { return }

  // get the souce iframe
  const matchSrc = ({ contentWindow }: HTMLIFrameElement | HTMLFrameElement) =>
    contentWindow === source
  const frame = (
    Array.from(document.querySelectorAll('iframe')).find(matchSrc) ||
    Array.from(document.querySelectorAll('frame')).find(matchSrc)
  )
  if (!frame) { return }

  const { left, top } = frame.getBoundingClientRect()
  const msg: Mutable<typeof data> = data
  msg.mouseX = msg.mouseX + left
  msg.mouseY = msg.mouseY + top
  sendMessage(msg)
})

/**
 * Escape key pressed
 */
isKeyPressed(isEscapeKey).subscribe(
  () => message.self.send({ type: MsgType.EscapeKey })
)

if(browser.isPlugin) {
  validMouseup$$.pipe(
    withLatestFrom(lastMousedown$$, clickPeriodCount$),
    filter(([/* [event, config] */, lastMousedownEvent]) => {
      if (isNoSelectionPage && !isInPanelOnInternalPage(lastMousedownEvent)) {
        return false
      }
  
      //输入框检查在这里！  if (config.noTypeField && isTypeField(lastMousedownEvent)) {
      return true
    }),
    map(args => {
      return [
        args,
        {
          text: selection.getSelectionText(),
          context: selection.getSelectionSentence(),
        },
      ] as [typeof args, { text: string, context: string }]
    }),
    distinctUntilChanged((oldVal, newVal) => {
      const clickPeriodCount = newVal[0][2]
      // (Ignore this rule if it is a double click.)
      // Same selection. This could be caused by other widget on the page
      // that uses preventDefault which stops selection being cleared when clicked.
      // Ignore it so that the panel won't follow.
      return Boolean(
        clickPeriodCount < 2 &&
        oldVal[1].text &&
        oldVal[1].text === newVal[1].text &&
        oldVal[1].context &&
        oldVal[1].context === newVal[1].context
      )
    })
  ).subscribe(([[[event], lastMousedownEvent, clickPeriodCount], partialSelInfo]) => {
    const isDictPanel = isSaladictInternalPage
      ? isInPanelOnInternalPage(lastMousedownEvent)
      : window.name === 'alloydict-dictpanel'
    //检查语言在这呢! checkSupportedLangs(config.language, partialSelInfo.text)
    sendMessage({
      mouseX: event.clientX,
      mouseY: event.clientY,
      dbClick: clickPeriodCount >= 2,
      shiftKey: Boolean(event['shiftKey']),
      ctrlKey: Boolean(event['ctrlKey']),
      metaKey: Boolean(event['metaKey']),
      self: isDictPanel,
      selectionInfo: selection.getSelectionInfo(partialSelInfo)
    })
  })
}
