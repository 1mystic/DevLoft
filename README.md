# DevLoft : Developer Power Tools

> 15 essential developer utilities forged from real data science workflows. All client-side, zero dependencies, instant load.

![License](https://img.shields.io/badge/license-MIT-blue)
![Tools](https://img.shields.io/badge/tools-15-6C63FF)
![Dependencies](https://img.shields.io/badge/dependencies-0-green)

## Tools

| # | Tool | Description | Origin |
|---|------|-------------|--------|
| 1 | **JSON Toolkit** | Format, minify, validate & convert JSON (row/columnar) | GA-1 Q29/Q30 |
| 2 | **Statistics Calculator** | Mean, median, variance (Bessel's correction), std dev | GA-1 Q37 |
| 3 | **Unicode to Markdown** | Convert mathematical Unicode (bold, italic, code) to Markdown | GA-1 Q34 |
| 4 | **Text Diff** | Line-by-line comparison with colored diff output | GA-1 Q36 |
| 5 | **Input Sanitizer** | XSS/SQLi detection + PII redaction (CC, SSN, email, API keys) | GA-1 Q27 |
| 6 | **CSV to SQL Schema** | Auto-detect types from CSV, generate CREATE TABLE (PG/MySQL/SQLite) | GA-1 Q16 |
| 7 | **Date Calculator** | Count weekdays, weekends, business days between dates | Entrance Exam |
| 8 | **LLM Cost Estimator** | Compare token pricing across 14 AI models | GA-1 Q25 |
| 9 | **Hash & Encode** | SHA-256, Base64 encode/decode, URL encode/decode | GA-1 Q10/Q11 |
| 10 | **Markdown to HTML** | Full Markdown parser with live preview | P1 Q4 |
| 11 | **Regex Tester** | Real-time match highlighting with capture groups | General Dev |
| 12 | **JSON Sort & Filter** | Sort arrays by key, filter by conditions (age>25) | Entrance Exam Q10 |
| 13 | **Word Counter** | Characters, words, sentences, reading/speaking time + frequency | GA-1 Q7 |
| 14 | **Base Converter** | Decimal / Hex / Octal / Binary | General Dev |
| 15 | **Color Converter** | HEX / RGB / HSL with live color swatch preview | General Dev |

## Quick Start

```bash
# No build step required — just serve the static files
npx serve .

# Or use Python
python -m http.server 8000

# Or just open index.html in your browser
```

## Deploy

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Netlify
Drag and drop the `DevLoft` folder into [Netlify Drop](https://app.netlify.com/drop).

### GitHub Pages
Push to a repo and enable Pages from Settings → Pages → Source: `main` / `root`.

## Project Structure

```
DevLoft/
├── index.html          # Landing page
├── tools.html          # All 15 tools
├── docs.html           # API documentation
├── css/
│   ├── main.css        # Global styles
│   ├── tools.css       # Tools page layout
│   └── docs.css        # Docs page layout
├── js/
│   ├── main.js         # Animations & back-to-top
│   ├── tools.js        # All tool implementations
│   └── docs.js         # Docs page navigation
└── README.md
```

## Tech Stack

- **HTML5** / **CSS3** / **Vanilla JavaScript**
- **Font Awesome 6.4** for icons
- **Google Fonts** (Montserrat)
- **Web Crypto API** for SHA-256 hashing
- Zero external JS libraries

## Privacy

All processing happens 100% client-side in your browser. No data is ever sent to any server.

## License

MIT
