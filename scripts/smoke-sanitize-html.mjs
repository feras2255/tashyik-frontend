import { sanitizeRichHtml } from '../app/utils/sanitizeHtml.js';

const payloads = [
  '<p>ok</p><script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg/onload=alert(1)>',
  '<a href="javascript:alert(1)">x</a>',
  '<p>Safe <strong>HTML</strong></p>',
];

let failed = false;

for (const payload of payloads) {
  const out = sanitizeRichHtml(payload);
  console.log(JSON.stringify(payload), '=>', JSON.stringify(out));

  if (/<script|onerror|onload|javascript:/i.test(out)) {
    console.error('FAIL: dangerous content remained');
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('OK: XSS payloads stripped');
