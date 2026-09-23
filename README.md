# PlainSignal

> Find the signal in a busy message.

**PlainSignal** is a small, privacy-first reading aid for dense emails, letters, notices, and instructions. Paste text into the page and it highlights practical details: potential action sentences, dates and times, contact methods, common jargon, and a readability estimate.

## Why it exists

Important messages are often hard to process when someone is tired, stressed, new to a language, navigating unfamiliar systems, or simply short on time. PlainSignal does not rewrite or judge a person’s reading ability. It gives the original words a calmer, action-first view.

## Privacy

There is no backend, account, tracking script, or analytics. Your text stays in the browser. This makes PlainSignal appropriate for sensitive everyday messages, but it is still a reading aid — always verify important details against the original.

## Use it

Open `index.html` in a browser. No install or build step is needed.

To host it with GitHub Pages, publish this folder from a repository’s root (or `/docs`) and enable Pages in the repository settings.

## Features

- Readability score based on the Flesch Reading Ease formula
- Detection of date-like text, times, email addresses, phone numbers, and links
- A small, transparent common-jargon dictionary
- Action-first calm reading mode
- Keyboard-friendly and responsive UI
- No network requests after the page loads

## Limits

PlainSignal uses simple, explainable pattern matching. It can miss context, identify something incorrectly, and cannot give legal, medical, financial, or benefits advice. Please check the source message before acting.

## Contribute

Useful contributions include improving the jargon list, accessibility review, translations, and tests for date formats.

## License

MIT. See [LICENSE](LICENSE).
