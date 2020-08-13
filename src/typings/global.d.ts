interface Window {
  __SALADICT_PANEL_LOADED__?: boolean

  // For self page messaging
  pageId?: number | string
  faviconURL?: string
  pageTitle?: string
  pageURL?: string

  __SALADICT_INTERNAL_PAGE__?: boolean
  __SALADICT_OPTIONS_PAGE__?: boolean
  __SALADICT_POPUP_PAGE__?: boolean
  __SALADICT_QUICK_SEARCH_PAGE__?: boolean
  __SALADICT_PDF_PAGE__?: boolean

  // Options page
  __SALADICT_LAST_SEARCH__?: string
}


declare namespace browser{
  var isPlugin:boolean;
  var isMobile:boolean;
  var dictAll:any;
  function _Language():string;
  function runtime_toggleFoldUnFold(force:any):any;
  function runtime_onMessage_addListener(vrw:any, listener:any):any;
  function storage_onChanged_addListener(vrw:any, listener:any):any;
  function storage_onChanged_removeListener(vrw:any, listener:any):any;
  function storage_get(vrw:any, fielf:any, args:any):any;
  function storage_set(vrw:any, fielf:any, args:any):any;
  function _URL(e:any):any;
  function runtime_sendMessage(b:any, e:any):any;
}
