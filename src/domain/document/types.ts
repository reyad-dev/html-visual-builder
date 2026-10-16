export type ImportWarningCode =
  | 'SCRIPT_REMOVED'
  | 'EVENT_HANDLER_REMOVED'
  | 'UNSAFE_URL_REMOVED'
  | 'EXTERNAL_STYLESHEET_NOT_LOADED'
  | 'EMBED_REMOVED'
  | 'MALFORMED_HTML_NORMALIZED'
  | 'REMOTE_ASSET_MAY_FAIL';

export interface ImportWarning {
  code: ImportWarningCode | string;
  message: string;
  count?: number | undefined;
  details?: string | undefined;
  severity?: 'info' | 'warning' | 'error' | undefined;
}

export interface DocumentMeta {
  name?: string | undefined;
  property?: string | undefined;
  content: string;
}

export interface SanitizedDocument {
  title: string;
  lang?: string | undefined;
  dir?: 'rtl' | 'ltr' | 'auto' | string | undefined;
  meta: DocumentMeta[];
  bodyHtml: string;
  html?: string | undefined;
  css: string;
  externalStylesheets: string[];
  warnings: ImportWarning[];
}

export interface ImportDocumentOptions {
  maxFileSize?: number | undefined;
  allowDataImages?: boolean | undefined;
}

export interface ExportOptions {
  title?: string | undefined;
  bodyHtml: string;
  css: string;
  lang?: string | undefined;
  dir?: 'rtl' | 'ltr' | 'auto' | string | undefined;
  meta?: DocumentMeta[] | undefined;
  externalStylesheets?: string[] | undefined;
}

