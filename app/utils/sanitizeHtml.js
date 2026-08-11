import DOMPurify from 'isomorphic-dompurify';

const RICH_HTML_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'ul',
    'ol',
    'li',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'img',
    'blockquote',
    'pre',
    'code',
    'span',
    'div',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'hr',
    'figure',
    'figcaption',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'colspan', 'rowspan'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Sanitize admin/CMS HTML before v-html (works on SSR and client via isomorphic-dompurify).
 */
export function sanitizeRichHtml(html) {
  if (html == null || html === '') {
    return '';
  }

  return DOMPurify.sanitize(String(html), RICH_HTML_CONFIG);
}
