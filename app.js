const sample = `Subject: Your housing benefit review is due by October 15, 2026\n\nHello Jordan,\n\nWe need a few documents to complete your annual review. Please submit proof of income and a current utility bill by October 15, 2026. You can upload them at https://cityhelp.example/review, email them to support@cityhelp.example, or call (555) 234-0198 between 9:00 AM and 5:00 PM.\n\nIf you need more time, contact us before the deadline. Your benefits may change if we do not hear from you.\n\nThank you,\nCity Help Team`;

const jargon = {
  "accommodate": "make room for or help with",
  "additional": "more",
  "assistance": "help",
  "commence": "start",
  "compensation": "payment",
  "concerning": "about",
  "documentation": "papers or proof",
  "eligibility": "whether you qualify",
  "expedite": "speed up",
  "furnish": "give or provide",
  "hereby": "by this message",
  "implementation": "putting something into action",
  "inquire": "ask",
  "notification": "notice",
  "obtain": "get",
  "participate": "take part",
  "pursuant": "under or according to",
  "regarding": "about",
  "reside": "live",
  "subsequent": "later or next",
  "utilize": "use",
  "verification": "proof or a check"
};

const actionPattern = /\b(please|must|need to|required|require|submit|apply|contact|call|email|upload|bring|send|complete|respond|reply|renew|sign|confirm|register|pay|visit)\b/i;
const datePattern = /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s.-]+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{2,4})?\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b(?:today|tomorrow|tonight|this\s+(?:week|month|Friday|Monday|Tuesday|Wednesday|Thursday|Saturday|Sunday)|next\s+week|deadline)\b/gi;
const timePattern = /\b(?:(?:[0-1]?\d|2[0-3]):[0-5]\d\s?(?:a\.?m\.?|p\.?m\.?)?|(?:[1-9]|1[0-2])\s?(?:a\.?m\.?|p\.?m\.?)?)\b/gi;
const emailPattern = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;
const phonePattern = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]\d{3,4}\b/g;
const urlPattern = /\bhttps?:\/\/[^\s<]+|\bwww\.[^\s<]+/g;

const message = document.querySelector('#message');
const wordCount = document.querySelector('#word-count');
const emptyState = document.querySelector('#empty-state');
const resultContent = document.querySelector('#result-content');

function words(text) { return text.trim().match(/[\p{L}\p{N}'’-]+/gu) || []; }
function sentences(text) {
  return text
    .split(/\r?\n+/)
    .flatMap(line => line.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
    .map(sentence => sentence.trim())
    .filter(Boolean);
}
function syllables(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 1;
  if (clean.length <= 3) return 1;
  const groups = clean.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'').match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}
function readingEase(text) {
  const allWords = words(text); const allSentences = sentences(text);
  if (!allWords.length) return null;
  const score = 206.835 - (1.015 * (allWords.length / Math.max(allSentences.length, 1))) - (84.6 * (allWords.reduce((n, word) => n + syllables(word), 0) / allWords.length));
  return Math.max(0, Math.min(100, Math.round(score)));
}
function level(score) {
  if (score >= 80) return ['Very easy to read', 'Short, familiar words and sentences.'];
  if (score >= 60) return ['Fairly easy to read', 'Most people can read this comfortably.'];
  if (score >= 40) return ['A little dense', 'Take it one sentence at a time.'];
  return ['Dense message', 'It may help to focus on the action items first.'];
}
function escapeHtml(value) { return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function unique(list) { return [...new Set(list.map(x => x.trim()).filter(Boolean))]; }
function listInto(selector, values, fallback, mark = false) {
  const target = document.querySelector(selector);
  target.innerHTML = values.length ? values.slice(0, 4).map(value => `<li>${mark ? value : escapeHtml(value)}</li>`).join('') : `<li class="empty">${fallback}</li>`;
}
function actionSentences(text) {
  return sentences(text).filter(sentence => actionPattern.test(sentence)).slice(0, 3);
}
function jargonHints(text) {
  const found = [];
  Object.entries(jargon).forEach(([term, meaning]) => {
    const match = new RegExp(`\\b${term}\\b`, 'i');
    if (match.test(text)) found.push(`<mark>${term}</mark> → ${meaning}`);
  });
  return found;
}
function cleanSignal(value) { return value.replace(/[.,;:]+$/g, ''); }
function getMatches(pattern, text) { return unique(Array.from(text.matchAll(pattern), match => cleanSignal(match[0]))); }
function updateWordCount() { const total = words(message.value).length; wordCount.textContent = `${total} word${total === 1 ? '' : 's'}`; }
function showResults() {
  const text = message.value.trim();
  if (!text) { message.focus(); return; }
  emptyState.hidden = true; resultContent.hidden = false;
  const score = readingEase(text); const [heading, copy] = level(score);
  document.querySelector('#score-value').textContent = score;
  document.querySelector('#score-label').textContent = heading;
  document.querySelector('#score-copy').textContent = copy;
  document.querySelector('#score-ring').style.borderColor = score >= 60 ? '#4a9a69' : score >= 40 ? '#d29330' : '#cf6d59';
  const actions = actionSentences(text);
  document.querySelector('#action-summary').textContent = actions.length ? `I found ${actions.length} sentence${actions.length === 1 ? '' : 's'} with a possible next step.` : 'I could not spot an obvious next step. Read the full message to be sure.';
  listInto('#action-list', actions, 'No action phrases found.');
  const dates = [...getMatches(datePattern, text), ...getMatches(timePattern, text)];
  listInto('#date-list', unique(dates), 'No clear dates or times found.');
  const contacts = [...getMatches(emailPattern, text), ...getMatches(phonePattern, text), ...getMatches(urlPattern, text)];
  listInto('#contact-list', unique(contacts), 'No email, phone, or link found.');
  listInto('#jargon-list', jargonHints(text), 'No common jargon from our small list.', true);
  const calm = actions.length ? actions : sentences(text).slice(0, 4);
  const calmList = document.querySelector('#calm-list');
  calmList.innerHTML = calm.map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

document.querySelector('#analyze-button').addEventListener('click', showResults);
document.querySelector('#sample-button').addEventListener('click', () => { message.value = sample; updateWordCount(); showResults(); message.focus(); });
document.querySelector('#clear-button').addEventListener('click', () => { message.value = ''; updateWordCount(); emptyState.hidden = false; resultContent.hidden = true; document.querySelector('#calm-reader').hidden = true; document.querySelector('#calm-toggle').setAttribute('aria-pressed', 'false'); document.body.classList.remove('calm-mode'); message.focus(); });
document.querySelector('#calm-toggle').addEventListener('click', event => { const enabled = event.currentTarget.getAttribute('aria-pressed') === 'true'; event.currentTarget.setAttribute('aria-pressed', String(!enabled)); document.querySelector('#calm-reader').hidden = enabled; document.body.classList.toggle('calm-mode', !enabled); });
message.addEventListener('input', updateWordCount);
message.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') showResults(); });
updateWordCount();
