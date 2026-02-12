// ============================================================
// DevLoft — Tools Logic
// All 10 client-side developer utilities
// ============================================================

const DevLoft = {};

// ---- Utility: Copy to clipboard ----
DevLoft.copyOutput = function (id, evt) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const e = evt || window.event;
        const btn = e && e.target ? e.target.closest('.btn-copy') : null;
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            btn.style.color = '#4CAF50';
            btn.style.borderColor = '#4CAF50';
            setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; btn.style.borderColor = ''; }, 1500);
        }
    }).catch(() => {
        // Fallback for non-HTTPS
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
    });
};

// ============================================================
// 1. JSON TOOLKIT
// ============================================================
DevLoft.json = {
    _getInput() {
        return document.getElementById('json-input').value.trim();
    },
    _setOutput(val) {
        document.getElementById('json-output').textContent = val;
    },
    format() {
        try {
            const data = JSON.parse(this._getInput());
            this._setOutput(JSON.stringify(data, null, 2));
        } catch (e) {
            this._setOutput('❌ Invalid JSON: ' + e.message);
        }
    },
    minify() {
        try {
            const data = JSON.parse(this._getInput());
            this._setOutput(JSON.stringify(data));
        } catch (e) {
            this._setOutput('❌ Invalid JSON: ' + e.message);
        }
    },
    validate() {
        try {
            const data = JSON.parse(this._getInput());
            const type = Array.isArray(data) ? 'Array' : typeof data;
            const size = JSON.stringify(data).length;
            let count = '';
            if (Array.isArray(data)) count = `\nElements: ${data.length}`;
            else if (typeof data === 'object' && data !== null) count = `\nKeys: ${Object.keys(data).length}`;
            this._setOutput(`✅ Valid JSON\nType: ${type}\nSize: ${size} bytes${count}`);
        } catch (e) {
            // Try to provide helpful error location
            const match = e.message.match(/position (\d+)/);
            let hint = '';
            if (match) {
                const pos = parseInt(match[1]);
                const input = this._getInput();
                const before = input.substring(Math.max(0, pos - 20), pos);
                const after = input.substring(pos, pos + 20);
                hint = `\n\nNear: ...${before}⚠️${after}...`;
            }
            this._setOutput('❌ Invalid JSON: ' + e.message + hint);
        }
    },
    toColumnar() {
        try {
            const data = JSON.parse(this._getInput());
            if (!Array.isArray(data) || data.length === 0) {
                this._setOutput('❌ Input must be a non-empty array of objects');
                return;
            }
            const columns = Object.keys(data[0]);
            const rows = data.map(obj => columns.map(col => obj[col] !== undefined ? obj[col] : null));
            this._setOutput(JSON.stringify({ columns, data: rows }, null, 2));
        } catch (e) {
            this._setOutput('❌ ' + e.message);
        }
    },
    toRows() {
        try {
            const input = JSON.parse(this._getInput());
            if (!input.columns || !input.data) {
                this._setOutput('❌ Input must have "columns" and "data" keys');
                return;
            }
            const result = input.data.map(row => {
                const obj = {};
                input.columns.forEach((col, i) => { obj[col] = row[i]; });
                return obj;
            });
            this._setOutput(JSON.stringify(result, null, 2));
        } catch (e) {
            this._setOutput('❌ ' + e.message);
        }
    }
};

// ============================================================
// 2. STATISTICS CALCULATOR
// ============================================================
DevLoft.stats = {
    calculate() {
        const raw = document.getElementById('stats-input').value.trim();
        const numbers = raw.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
        if (numbers.length === 0) { alert('Enter at least one number'); return; }

        const n = numbers.length;
        const sorted = [...numbers].sort((a, b) => a - b);
        const sum = numbers.reduce((a, b) => a + b, 0);
        const mean = sum / n;
        const median = n % 2 === 0
            ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
            : sorted[Math.floor(n / 2)];
        const popVariance = numbers.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
        const sampleVariance = n > 1 ? numbers.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1) : 0;
        const popStdDev = Math.sqrt(popVariance);
        const sampleStdDev = Math.sqrt(sampleVariance);
        const min = sorted[0];
        const max = sorted[n - 1];
        const range = max - min;

        const results = [
            { label: 'Count', value: n },
            { label: 'Sum', value: sum.toFixed(4) },
            { label: 'Mean', value: mean.toFixed(4) },
            { label: 'Median', value: median.toFixed(4) },
            { label: 'Pop. Variance', value: popVariance.toFixed(4) },
            { label: 'Sample Var (N-1)', value: sampleVariance.toFixed(4) },
            { label: 'Pop. Std Dev', value: popStdDev.toFixed(4) },
            { label: 'Sample Std Dev', value: sampleStdDev.toFixed(4) },
            { label: 'Min', value: min },
            { label: 'Max', value: max },
            { label: 'Range', value: range.toFixed(4) },
        ];

        const grid = document.getElementById('stats-grid');
        grid.innerHTML = results.map(r =>
            `<div class="result-item"><div class="label">${r.label}</div><div class="value">${r.value}</div></div>`
        ).join('');
        document.getElementById('stats-results').style.display = 'block';
    },
    loadSample() {
        document.getElementById('stats-input').value = '14, 18, 13, 16, 12, 17, 19, 11, 15, 20';
        this.calculate();
    }
};

// ============================================================
// 3. UNICODE → MARKDOWN
// ============================================================
DevLoft.unicode = {
    convert() {
        const input = document.getElementById('unicode-input').value;
        let output = '';

        // Ranges for Mathematical Alphanumeric Symbols
        const ranges = {
            boldUpper: [0x1D5D4, 0x1D5ED],     // 𝗔-𝗭
            boldLower: [0x1D5EE, 0x1D607],     // 𝗮-𝘇
            italicUpper: [0x1D608, 0x1D621],   // 𝘈-𝘡
            italicLower: [0x1D622, 0x1D63B],   // 𝘢-𝘻
            monoUpper: [0x1D670, 0x1D689],     // 𝙰-𝚉
            monoLower: [0x1D68A, 0x1D6A3],     // 𝚊-𝚣
            boldDigits: [0x1D7CE, 0x1D7D7],    // 𝟎-𝟗
            // Additional bold ranges (serif)
            boldSerifUpper: [0x1D400, 0x1D419],
            boldSerifLower: [0x1D41A, 0x1D433],
            italicSerifUpper: [0x1D434, 0x1D44D],
            italicSerifLower: [0x1D44E, 0x1D467],
        };

        function getCharType(cp) {
            if ((cp >= ranges.boldUpper[0] && cp <= ranges.boldUpper[1]) ||
                (cp >= ranges.boldLower[0] && cp <= ranges.boldLower[1]) ||
                (cp >= ranges.boldSerifUpper[0] && cp <= ranges.boldSerifUpper[1]) ||
                (cp >= ranges.boldSerifLower[0] && cp <= ranges.boldSerifLower[1]) ||
                (cp >= ranges.boldDigits[0] && cp <= ranges.boldDigits[1])) return 'bold';
            if ((cp >= ranges.italicUpper[0] && cp <= ranges.italicUpper[1]) ||
                (cp >= ranges.italicLower[0] && cp <= ranges.italicLower[1]) ||
                (cp >= ranges.italicSerifUpper[0] && cp <= ranges.italicSerifUpper[1]) ||
                (cp >= ranges.italicSerifLower[0] && cp <= ranges.italicSerifLower[1])) return 'italic';
            if ((cp >= ranges.monoUpper[0] && cp <= ranges.monoUpper[1]) ||
                (cp >= ranges.monoLower[0] && cp <= ranges.monoLower[1])) return 'mono';
            return null;
        }

        function toPlainChar(cp) {
            // Sans-serif bold
            if (cp >= ranges.boldUpper[0] && cp <= ranges.boldUpper[1]) return String.fromCharCode(65 + cp - ranges.boldUpper[0]);
            if (cp >= ranges.boldLower[0] && cp <= ranges.boldLower[1]) return String.fromCharCode(97 + cp - ranges.boldLower[0]);
            // Sans-serif italic
            if (cp >= ranges.italicUpper[0] && cp <= ranges.italicUpper[1]) return String.fromCharCode(65 + cp - ranges.italicUpper[0]);
            if (cp >= ranges.italicLower[0] && cp <= ranges.italicLower[1]) return String.fromCharCode(97 + cp - ranges.italicLower[0]);
            // Monospace
            if (cp >= ranges.monoUpper[0] && cp <= ranges.monoUpper[1]) return String.fromCharCode(65 + cp - ranges.monoUpper[0]);
            if (cp >= ranges.monoLower[0] && cp <= ranges.monoLower[1]) return String.fromCharCode(97 + cp - ranges.monoLower[0]);
            // Serif bold
            if (cp >= ranges.boldSerifUpper[0] && cp <= ranges.boldSerifUpper[1]) return String.fromCharCode(65 + cp - ranges.boldSerifUpper[0]);
            if (cp >= ranges.boldSerifLower[0] && cp <= ranges.boldSerifLower[1]) return String.fromCharCode(97 + cp - ranges.boldSerifLower[0]);
            // Serif italic
            if (cp >= ranges.italicSerifUpper[0] && cp <= ranges.italicSerifUpper[1]) return String.fromCharCode(65 + cp - ranges.italicSerifUpper[0]);
            if (cp >= ranges.italicSerifLower[0] && cp <= ranges.italicSerifLower[1]) return String.fromCharCode(97 + cp - ranges.italicSerifLower[0]);
            // Bold digits
            if (cp >= ranges.boldDigits[0] && cp <= ranges.boldDigits[1]) return String.fromCharCode(48 + cp - ranges.boldDigits[0]);
            return String.fromCodePoint(cp);
        }

        const codePoints = [...input];
        let currentType = null;
        let buffer = '';

        for (const char of codePoints) {
            const cp = char.codePointAt(0);
            const type = getCharType(cp);

            if (type !== currentType) {
                if (buffer && currentType) {
                    const wrap = currentType === 'bold' ? '**' : currentType === 'italic' ? '*' : '`';
                    output += wrap + buffer + wrap;
                } else {
                    output += buffer;
                }
                buffer = '';
                currentType = type;
            }
            buffer += type ? toPlainChar(cp) : char;
        }
        // Flush remaining buffer
        if (buffer && currentType) {
            const wrap = currentType === 'bold' ? '**' : currentType === 'italic' ? '*' : '`';
            output += wrap + buffer + wrap;
        } else {
            output += buffer;
        }

        document.getElementById('unicode-output').textContent = output;
    },
    loadSample() {
        document.getElementById('unicode-input').value = '𝗧𝗵𝗶𝘀 𝗶𝘀 𝗯𝗼𝗹𝗱 text and 𝘵𝘩𝘪𝘴 𝘪𝘴 𝘪𝘵𝘢𝘭𝘪𝘤 and 𝚝𝚑𝚒𝚜 𝚒𝚜 𝚌𝚘𝚍𝚎';
        this.convert();
    }
};

// ============================================================
// 4. TEXT DIFF
// ============================================================
DevLoft.diff = {
    compare() {
        const a = document.getElementById('diff-input-a').value.split('\n');
        const b = document.getElementById('diff-input-b').value.split('\n');
        const maxLen = Math.max(a.length, b.length);
        let same = 0, different = 0, added = 0, removed = 0;
        let html = '';

        for (let i = 0; i < maxLen; i++) {
            const lineA = i < a.length ? a[i] : undefined;
            const lineB = i < b.length ? b[i] : undefined;

            if (lineA === undefined) {
                added++;
                html += `<div class="diff-line added">+ ${this._esc(lineB)}</div>`;
            } else if (lineB === undefined) {
                removed++;
                html += `<div class="diff-line removed">- ${this._esc(lineA)}</div>`;
            } else if (lineA === lineB) {
                same++;
                html += `<div class="diff-line same">  ${this._esc(lineA)}</div>`;
            } else {
                different++;
                html += `<div class="diff-line removed">- ${this._esc(lineA)}</div>`;
                html += `<div class="diff-line added">+ ${this._esc(lineB)}</div>`;
            }
        }

        document.getElementById('diff-output').innerHTML = html;
        document.getElementById('diff-stats').innerHTML = [
            { label: 'Same Lines', value: same },
            { label: 'Changed', value: different },
            { label: 'Added', value: added },
            { label: 'Removed', value: removed },
            { label: 'Total Lines A', value: a.length },
            { label: 'Total Lines B', value: b.length },
        ].map(r => `<div class="result-item"><div class="label">${r.label}</div><div class="value">${r.value}</div></div>`).join('');
        document.getElementById('diff-summary').style.display = 'block';
    },
    _esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    loadSample() {
        document.getElementById('diff-input-a').value = 'Hello World\nThis is line 2\nLine three here\nFourth line\nFifth line';
        document.getElementById('diff-input-b').value = 'Hello World\nThis is line TWO\nLine three here\nNew fourth line\nFifth line\nSixth line added';
        this.compare();
    }
};

// ============================================================
// 5. INPUT SANITIZER & PII REDACTOR
// ============================================================
DevLoft.sanitizer = {
    patterns: {
        xss: [
            { regex: /<script[\s>]/gi, name: 'Script Tag Injection' },
            { regex: /on\w+\s*=/gi, name: 'Event Handler Injection' },
            { regex: /javascript:/gi, name: 'JavaScript Protocol' },
            { regex: /<iframe/gi, name: 'IFrame Injection' },
            { regex: /<object/gi, name: 'Object Tag Injection' },
            { regex: /<embed/gi, name: 'Embed Tag Injection' },
        ],
        sqli: [
            { regex: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b.*\b(FROM|INTO|TABLE|SET|WHERE)\b)/gi, name: 'SQL Statement' },
            { regex: /(['"])\s*(OR|AND)\s+\1?\s*\d+\s*=\s*\d+/gi, name: 'Tautology Injection' },
            { regex: /;\s*(DROP|DELETE|UPDATE|INSERT)/gi, name: 'Stacked Query' },
            { regex: /--\s*$/gm, name: 'SQL Comment' },
            { regex: /\/\*.*?\*\//gs, name: 'Block Comment Injection' },
        ],
        pii: {
            creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
            ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            phone: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
            apiKey: /\b(sk-[a-zA-Z0-9]{20,}|api[_-]?key[=:\s]+\S{10,}|bearer\s+\S{10,})/gi,
            ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
        }
    },

    scan() {
        const input = document.getElementById('sanitizer-input').value;
        const alerts = [];

        // XSS checks
        this.patterns.xss.forEach(p => {
            const matches = input.match(p.regex);
            if (matches) alerts.push({ type: 'danger', icon: 'skull-crossbones', msg: `⚠️ XSS: ${p.name} (${matches.length} found)` });
        });

        // SQL injection checks
        this.patterns.sqli.forEach(p => {
            const matches = input.match(p.regex);
            if (matches) alerts.push({ type: 'danger', icon: 'database', msg: `⚠️ SQL Injection: ${p.name} (${matches.length} found)` });
        });

        // PII checks
        const piiNames = {
            creditCard: 'Credit Card Numbers',
            ssn: 'Social Security Numbers',
            email: 'Email Addresses',
            phone: 'Phone Numbers',
            apiKey: 'API Keys / Tokens',
            ipAddress: 'IP Addresses'
        };
        for (const [key, regex] of Object.entries(this.patterns.pii)) {
            const matches = input.match(regex);
            if (matches) alerts.push({ type: 'warning', icon: 'eye-slash', msg: `🔍 PII: ${piiNames[key]} (${matches.length} found)` });
        }

        if (alerts.length === 0) {
            alerts.push({ type: 'success', icon: 'check-circle', msg: '✅ No security threats or PII detected.' });
        }

        document.getElementById('sanitizer-alerts').innerHTML = alerts.map(a =>
            `<div class="alert alert-${a.type}"><i class="fa-solid fa-${a.icon}"></i> ${a.msg}</div>`
        ).join('');
        document.getElementById('sanitizer-output').textContent = '';
    },

    redact() {
        let text = document.getElementById('sanitizer-input').value;

        // Redact PII
        text = text.replace(this.patterns.pii.creditCard, '[CREDIT_CARD_REDACTED]');
        text = text.replace(this.patterns.pii.ssn, '[SSN_REDACTED]');
        text = text.replace(this.patterns.pii.email, '[EMAIL_REDACTED]');
        text = text.replace(this.patterns.pii.phone, '[PHONE_REDACTED]');
        text = text.replace(this.patterns.pii.apiKey, '[API_KEY_REDACTED]');

        // Sanitize XSS
        text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[SCRIPT_REMOVED]');
        text = text.replace(/<(iframe|object|embed)[^>]*>/gi, '[DANGEROUS_TAG_REMOVED]');
        text = text.replace(/on\w+\s*=\s*(['"])[^'"]*\1/gi, '[EVENT_HANDLER_REMOVED]');

        document.getElementById('sanitizer-output').textContent = text;
        this.scan(); // Also show alerts
    },

    loadSample() {
        document.getElementById('sanitizer-input').value = `Hello, my name is John Doe.
My email is john.doe@example.com and my SSN is 123-45-6789.
Credit card: 4532-1234-5678-9012
Phone: (555) 123-4567

<script>alert("XSS attack!")</script>
<img onerror="steal(document.cookie)" src=x>

SELECT * FROM users WHERE id = 1 OR 1=1 --
DROP TABLE users;

API Key: sk-proj-abcdef1234567890abcdef`;
        this.scan();
    }
};

// ============================================================
// 6. CSV → SQL SCHEMA
// ============================================================
DevLoft.csv = {
    generate() {
        const csv = document.getElementById('csv-input').value.trim();
        const tableName = document.getElementById('csv-table-name').value.trim() || 'my_table';
        const dialect = document.getElementById('csv-dialect').value;
        if (!csv) { alert('Enter CSV data'); return; }

        const lines = csv.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) { document.getElementById('csv-output').textContent = '❌ Need at least header + 1 data row'; return; }

        const headers = this._parseCsvLine(lines[0]);
        const dataRows = lines.slice(1).map(l => this._parseCsvLine(l));

        const columns = headers.map((header, idx) => {
            const values = dataRows.map(row => row[idx] || '').filter(v => v !== '');
            return {
                name: header.toLowerCase().replace(/\s+/g, '_'),
                type: this._inferType(values, dialect),
                nullable: values.length < dataRows.length
            };
        });

        let sql = `CREATE TABLE ${tableName} (\n`;
        sql += columns.map((col, i) => {
            let def = `    ${col.name} ${col.type}`;
            if (!col.nullable) def += ' NOT NULL';
            return def;
        }).join(',\n');
        sql += '\n);';

        // Add sample INSERT
        sql += `\n\n-- Sample INSERT\nINSERT INTO ${tableName} (${columns.map(c => c.name).join(', ')})\nVALUES\n`;
        sql += dataRows.slice(0, 3).map(row => {
            const vals = row.map((v, i) => {
                if (columns[i].type.match(/INT|NUMERIC|DECIMAL|REAL|FLOAT|DOUBLE/i)) return v;
                if (columns[i].type === 'BOOLEAN' || columns[i].type === 'BOOL') return v.toLowerCase();
                return `'${v.replace(/'/g, "''")}'`;
            });
            return `    (${vals.join(', ')})`;
        }).join(',\n');
        sql += ';';

        document.getElementById('csv-output').textContent = sql;
    },

    _parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (const char of line) {
            if (char === '"') { inQuotes = !inQuotes; }
            else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
            else { current += char; }
        }
        result.push(current.trim());
        return result;
    },

    _inferType(values, dialect) {
        const allInt = values.every(v => /^-?\d+$/.test(v));
        if (allInt) {
            const max = Math.max(...values.map(Number));
            if (max > 2147483647) return dialect === 'sqlite' ? 'INTEGER' : 'BIGINT';
            return 'INTEGER';
        }
        const allNum = values.every(v => /^-?\d+\.?\d*$/.test(v));
        if (allNum) return dialect === 'postgresql' ? 'NUMERIC' : dialect === 'sqlite' ? 'REAL' : 'DECIMAL(12,2)';

        const allBool = values.every(v => /^(true|false|0|1|yes|no)$/i.test(v));
        if (allBool) return dialect === 'sqlite' ? 'INTEGER' : 'BOOLEAN';

        const allDate = values.every(v => /^\d{4}-\d{2}-\d{2}$/.test(v));
        if (allDate) return 'DATE';

        const allDateTime = values.every(v => /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(v));
        if (allDateTime) return dialect === 'sqlite' ? 'TEXT' : 'TIMESTAMP';

        const allEmail = values.every(v => /^[^@]+@[^@]+\.[^@]+$/.test(v));
        const maxLen = Math.max(...values.map(v => v.length));
        if (maxLen > 500) return 'TEXT';
        return dialect === 'sqlite' ? 'TEXT' : `VARCHAR(${Math.max(255, Math.ceil(maxLen / 50) * 50)})`;
    },

    loadSample() {
        document.getElementById('csv-input').value = `id,name,email,age,salary,is_active,hire_date
1,Alice Smith,alice@example.com,30,75000.50,true,2020-01-15
2,Bob Jones,bob@test.com,25,62000.00,false,2021-06-20
3,Charlie Brown,charlie@work.org,35,89000.75,true,2019-03-01
4,Diana Prince,diana@hero.com,28,71000.25,true,2022-11-10`;
        this.generate();
    }
};

// ============================================================
// 7. DATE CALCULATOR
// ============================================================
DevLoft.date = {
    calculate() {
        const startStr = document.getElementById('date-start').value;
        const endStr = document.getElementById('date-end').value;
        if (!startStr || !endStr) { alert('Select both dates'); return; }

        const start = new Date(startStr);
        const end = new Date(endStr);
        if (start > end) { alert('Start date must be before end date'); return; }

        let totalDays = 0, weekdays = 0, saturdays = 0, sundays = 0;
        const current = new Date(start);
        while (current <= end) {
            totalDays++;
            const day = current.getDay();
            if (day === 0) sundays++;
            else if (day === 6) saturdays++;
            else weekdays++;
            current.setDate(current.getDate() + 1);
        }

        const weeks = Math.floor(totalDays / 7);
        const remainDays = totalDays % 7;

        document.getElementById('date-grid').innerHTML = [
            { label: 'Total Days', value: totalDays },
            { label: 'Weekdays', value: weekdays },
            { label: 'Weekends', value: saturdays + sundays },
            { label: 'Saturdays', value: saturdays },
            { label: 'Sundays', value: sundays },
            { label: 'Full Weeks', value: weeks },
            { label: 'Remaining Days', value: remainDays },
        ].map(r => `<div class="result-item"><div class="label">${r.label}</div><div class="value">${r.value}</div></div>`).join('');
        document.getElementById('date-results').style.display = 'block';
    }
};

// ============================================================
// 8. LLM COST ESTIMATOR
// ============================================================
DevLoft.llm = {
    models: [
        { name: 'GPT-4o', input: 2.50, output: 10.00 },
        { name: 'GPT-4o Mini', input: 0.15, output: 0.60 },
        { name: 'GPT-4.1', input: 2.00, output: 8.00 },
        { name: 'GPT-4.1 Mini', input: 0.40, output: 1.60 },
        { name: 'GPT-4.1 Nano', input: 0.10, output: 0.40 },
        { name: 'Claude Opus 4', input: 15.00, output: 75.00 },
        { name: 'Claude Sonnet 4', input: 3.00, output: 15.00 },
        { name: 'Claude Haiku 3.5', input: 0.80, output: 4.00 },
        { name: 'Gemini 2.5 Pro', input: 1.25, output: 10.00 },
        { name: 'Gemini 2.5 Flash', input: 0.15, output: 0.60 },
        { name: 'DeepSeek V3', input: 0.27, output: 1.10 },
        { name: 'DeepSeek R1', input: 0.55, output: 2.19 },
        { name: 'Llama 4 Scout', input: 0.18, output: 0.59 },
        { name: 'Mistral Large 2', input: 2.00, output: 6.00 },
    ],

    estimate() {
        const requests = parseInt(document.getElementById('llm-requests').value) || 1;
        const inputTok = parseInt(document.getElementById('llm-input-tokens').value) || 1;
        const outputTok = parseInt(document.getElementById('llm-output-tokens').value) || 1;

        const results = this.models.map(m => {
            const inputCost = (requests * inputTok / 1_000_000) * m.input;
            const outputCost = (requests * outputTok / 1_000_000) * m.output;
            const total = inputCost + outputCost;
            return { ...m, total, perRequest: total / requests };
        }).sort((a, b) => a.total - b.total);

        const cheapest = results[0].total;
        const mostExpensive = results[results.length - 1].total;

        document.getElementById('llm-tbody').innerHTML = results.map((r, idx) => {
            const cls = idx === 0 ? 'cheapest' : r.total === mostExpensive ? 'expensive' : '';
            return `<tr>
                <td>${idx === 0 ? '🏆 ' : ''}${r.name}</td>
                <td>$${r.input.toFixed(2)}</td>
                <td>$${r.output.toFixed(2)}</td>
                <td class="${cls}">$${r.total.toFixed(2)}</td>
                <td>$${r.perRequest.toFixed(6)}</td>
            </tr>`;
        }).join('');
        document.getElementById('llm-results').style.display = 'block';
    }
};

// ============================================================
// 9. HASH & ENCODE
// ============================================================
DevLoft.hash = {
    async sha256() {
        const input = document.getElementById('hash-input').value;
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        document.getElementById('hash-output').textContent = hashHex;
    },
    base64Encode() {
        const input = document.getElementById('hash-input').value;
        try {
            // Handle Unicode properly
            const bytes = new TextEncoder().encode(input);
            let binary = '';
            bytes.forEach(b => binary += String.fromCharCode(b));
            document.getElementById('hash-output').textContent = btoa(binary);
        } catch (e) {
            document.getElementById('hash-output').textContent = '❌ ' + e.message;
        }
    },
    base64Decode() {
        const input = document.getElementById('hash-input').value;
        try {
            const binary = atob(input.trim());
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            document.getElementById('hash-output').textContent = new TextDecoder().decode(bytes);
        } catch (e) {
            document.getElementById('hash-output').textContent = '❌ Invalid Base64: ' + e.message;
        }
    },
    urlEncode() {
        document.getElementById('hash-output').textContent = encodeURIComponent(document.getElementById('hash-input').value);
    },
    urlDecode() {
        try {
            document.getElementById('hash-output').textContent = decodeURIComponent(document.getElementById('hash-input').value);
        } catch (e) {
            document.getElementById('hash-output').textContent = '❌ ' + e.message;
        }
    }
};

// ============================================================
// 10. MARKDOWN → HTML
// ============================================================
DevLoft.md = {
    convert() {
        const input = document.getElementById('md-input').value;
        const html = this._parse(input);
        document.getElementById('md-preview').innerHTML = html;
        document.getElementById('md-raw').textContent = html;
    },

    _parse(md) {
        let html = md;

        // Fenced code blocks (must be done first)
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) => {
            return `<pre><code class="language-${lang}">${this._esc(code.trim())}</code></pre>`;
        });

        // Tables
        html = html.replace(/^(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)+)/gm, (match, header, sep, body) => {
            const headers = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
            const rows = body.trim().split('\n').map(row => {
                const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
                return `<tr>${cells}</tr>`;
            }).join('');
            return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
        });

        // Blockquotes
        html = html.replace(/^>\s*(.+)$/gm, '<blockquote><p>$1</p></blockquote>');

        // Headers
        html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
        html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
        html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

        // Horizontal rules
        html = html.replace(/^---+$/gm, '<hr>');

        // Unordered lists
        html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

        // Ordered lists
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

        // Task lists
        html = html.replace(/<li>\[x\]\s*/gi, '<li>☑ ');
        html = html.replace(/<li>\[\s?\]\s*/gi, '<li>☐ ');

        // Inline code (must be before bold/italic)
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold + Italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Strikethrough
        html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

        // Paragraphs (lines that aren't already tagged)
        html = html.replace(/^(?!<[a-z/])((?!\s*$).+)$/gm, '<p>$1</p>');

        // Clean up extra whitespace
        html = html.replace(/\n{3,}/g, '\n\n');

        return html.trim();
    },

    _esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    showRaw() {
        const section = document.getElementById('md-raw-section');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    },

    loadSample() {
        document.getElementById('md-input').value = `# DevLoft Documentation

## Overview

This is **bold text** and *italic text* and \`inline code\`.

### Features

- JSON formatting & validation
- Statistics calculator
- ~~Deprecated feature~~

### Code Example

\`\`\`python
def hello():
    print("Hello, DevLoft!")
\`\`\`

> This is a blockquote with important information.

### Task List

- [x] Build frontend
- [x] Add tools
- [ ] Deploy to Vercel

### Data Table

| Tool | Category | Status |
|------|----------|--------|
| JSON Toolkit | Data | Ready |
| Sanitizer | Security | Ready |
| LLM Cost | AI | Ready |

---

Visit [DevLoft](https://DevLoft.dev) for more info.`;
        this.convert();
    }
};

// ============================================================
// 11. REGEX TESTER
// ============================================================
DevLoft.regex = {
    test() {
        const pattern = document.getElementById('regex-pattern').value;
        const flags = document.getElementById('regex-flags').value;
        const input = document.getElementById('regex-input').value;
        const highlightEl = document.getElementById('regex-highlight');
        const detailsEl = document.getElementById('regex-details');
        const resultsEl = document.getElementById('regex-results');

        if (!pattern) { highlightEl.innerHTML = '<span style="color:#f44">Enter a regex pattern</span>'; return; }

        let re;
        try {
            re = new RegExp(pattern, flags);
        } catch (e) {
            highlightEl.innerHTML = `<span style="color:#f44">Invalid regex: ${e.message}</span>`;
            resultsEl.style.display = 'none';
            return;
        }

        // Find all matches
        const matches = [];
        let m;
        const isGlobal = flags.includes('g');
        if (isGlobal) {
            while ((m = re.exec(input)) !== null) {
                matches.push({ index: m.index, length: m[0].length, value: m[0], groups: m.slice(1) });
                if (m[0].length === 0) re.lastIndex++; // prevent infinite loop
            }
        } else {
            m = re.exec(input);
            if (m) matches.push({ index: m.index, length: m[0].length, value: m[0], groups: m.slice(1) });
        }

        // Build highlighted text
        if (matches.length === 0) {
            highlightEl.innerHTML = this._esc(input) + '<br><br><span style="color:#f44;">No matches found</span>';
            resultsEl.style.display = 'none';
            return;
        }

        let highlighted = '';
        let lastIdx = 0;
        matches.forEach(match => {
            highlighted += this._esc(input.substring(lastIdx, match.index));
            highlighted += `<mark style="background:#6C63FF33;color:#fff;border:1px solid #6C63FF;border-radius:3px;padding:1px 2px;">${this._esc(match.value)}</mark>`;
            lastIdx = match.index + match.length;
        });
        highlighted += this._esc(input.substring(lastIdx));
        highlightEl.innerHTML = highlighted;

        // Build match details
        let details = `<strong>${matches.length} match${matches.length > 1 ? 'es' : ''} found</strong>\n\n`;
        matches.forEach((match, i) => {
            details += `Match ${i + 1}: "${match.value}" at index ${match.index}\n`;
            if (match.groups.length > 0) {
                match.groups.forEach((g, gi) => {
                    details += `  Group ${gi + 1}: "${g || ''}"\n`;
                });
            }
        });
        detailsEl.textContent = details;
        resultsEl.style.display = 'block';
    },
    _esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    },
    loadSample() {
        document.getElementById('regex-pattern').value = '(\\d{4})-(\\d{2})-(\\d{2})';
        document.getElementById('regex-flags').value = 'g';
        document.getElementById('regex-input').value = 'Event dates: 2025-01-15, 2025-03-22, and 2025-12-31.\nInvalid: 99-1-1, abc-de-fg';
        this.test();
    }
};

// ============================================================
// 12. JSON SORT & FILTER
// ============================================================
DevLoft.jsort = {
    _getInput() {
        try {
            const data = JSON.parse(document.getElementById('jsort-input').value.trim());
            if (!Array.isArray(data)) throw new Error('Input must be a JSON array');
            return data;
        } catch (e) {
            document.getElementById('jsort-output').textContent = '❌ ' + e.message;
            return null;
        }
    },
    _setOutput(data) {
        document.getElementById('jsort-output').textContent = JSON.stringify(data, null, 2);
    },
    sort() {
        const data = this._getInput();
        if (!data) return;
        const key = document.getElementById('jsort-key').value.trim();
        const order = document.getElementById('jsort-order').value;
        if (!key) { document.getElementById('jsort-output').textContent = '❌ Enter a sort key'; return; }

        const sorted = [...data].sort((a, b) => {
            let va = a[key], vb = b[key];
            if (va === undefined) va = '';
            if (vb === undefined) vb = '';
            if (typeof va === 'number' && typeof vb === 'number') return order === 'asc' ? va - vb : vb - va;
            va = String(va).toLowerCase();
            vb = String(vb).toLowerCase();
            if (va < vb) return order === 'asc' ? -1 : 1;
            if (va > vb) return order === 'asc' ? 1 : -1;
            return 0;
        });
        this._setOutput(sorted);
    },
    _parseFilter(filterStr) {
        // Parse: key>value, key<value, key>=value, key<=value, key=value, key!=value
        const m = filterStr.match(/^(\w+)\s*(>=|<=|!=|>|<|=)\s*(.+)$/);
        if (!m) return null;
        return { key: m[1], op: m[2], val: m[3] };
    },
    _applyFilter(data, filterStr) {
        const f = this._parseFilter(filterStr);
        if (!f) {
            document.getElementById('jsort-output').textContent = '❌ Invalid filter. Use: key=value, key>value, key<value, key>=value, key<=value, key!=value';
            return null;
        }
        return data.filter(item => {
            let v = item[f.key];
            let fv = f.val;
            // Try numeric comparison
            const numV = Number(v), numFV = Number(fv);
            const isNum = !isNaN(numV) && !isNaN(numFV);
            switch (f.op) {
                case '=': return isNum ? numV === numFV : String(v).toLowerCase() === fv.toLowerCase();
                case '!=': return isNum ? numV !== numFV : String(v).toLowerCase() !== fv.toLowerCase();
                case '>': return isNum ? numV > numFV : String(v) > fv;
                case '<': return isNum ? numV < numFV : String(v) < fv;
                case '>=': return isNum ? numV >= numFV : String(v) >= fv;
                case '<=': return isNum ? numV <= numFV : String(v) <= fv;
                default: return true;
            }
        });
    },
    filter() {
        const data = this._getInput();
        if (!data) return;
        const filterStr = document.getElementById('jsort-filter').value.trim();
        if (!filterStr) { document.getElementById('jsort-output').textContent = '❌ Enter a filter condition'; return; }
        const result = this._applyFilter(data, filterStr);
        if (result !== null) this._setOutput(result);
    },
    sortAndFilter() {
        const data = this._getInput();
        if (!data) return;
        const key = document.getElementById('jsort-key').value.trim();
        const order = document.getElementById('jsort-order').value;
        const filterStr = document.getElementById('jsort-filter').value.trim();

        let result = data;
        if (filterStr) {
            result = this._applyFilter(result, filterStr);
            if (result === null) return;
        }
        if (key) {
            result = [...result].sort((a, b) => {
                let va = a[key], vb = b[key];
                if (va === undefined) va = '';
                if (vb === undefined) vb = '';
                if (typeof va === 'number' && typeof vb === 'number') return order === 'asc' ? va - vb : vb - va;
                va = String(va).toLowerCase();
                vb = String(vb).toLowerCase();
                if (va < vb) return order === 'asc' ? -1 : 1;
                if (va > vb) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }
        this._setOutput(result);
    },
    loadSample() {
        document.getElementById('jsort-input').value = JSON.stringify([
            { name: 'Charlie', age: 35, city: 'NY', score: 88 },
            { name: 'Alice', age: 30, city: 'SF', score: 95 },
            { name: 'Eve', age: 22, city: 'NY', score: 72 },
            { name: 'Bob', age: 25, city: 'LA', score: 81 },
            { name: 'Diana', age: 28, city: 'SF', score: 90 },
            { name: 'Frank', age: 40, city: 'NY', score: 65 }
        ], null, 2);
        document.getElementById('jsort-key').value = 'score';
        document.getElementById('jsort-order').value = 'desc';
        document.getElementById('jsort-filter').value = 'age>25';
        this.sortAndFilter();
    }
};

// ============================================================
// 13. WORD & CHARACTER COUNTER
// ============================================================
DevLoft.wc = {
    count() {
        const text = document.getElementById('wc-input').value;
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
        const lines = text === '' ? 0 : text.split('\n').length;
        const readMin = Math.ceil(words / 200);
        const speakMin = Math.ceil(words / 130);

        document.getElementById('wc-chars').textContent = chars.toLocaleString();
        document.getElementById('wc-chars-ns').textContent = charsNoSpaces.toLocaleString();
        document.getElementById('wc-words').textContent = words.toLocaleString();
        document.getElementById('wc-sentences').textContent = sentences.toLocaleString();
        document.getElementById('wc-paragraphs').textContent = paragraphs.toLocaleString();
        document.getElementById('wc-lines').textContent = lines.toLocaleString();
        document.getElementById('wc-read-time').textContent = readMin < 1 ? '< 1 min' : `${readMin} min`;
        document.getElementById('wc-speak-time').textContent = speakMin < 1 ? '< 1 min' : `${speakMin} min`;

        // Word frequency
        if (words > 0) {
            const freq = {};
            text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2).forEach(w => {
                freq[w] = (freq[w] || 0) + 1;
            });
            const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
            if (sorted.length > 0) {
                document.getElementById('wc-freq').textContent = sorted.map(([w, c]) => `${w}: ${c}`).join('\n');
                document.getElementById('wc-freq-card').style.display = 'block';
            }
        } else {
            document.getElementById('wc-freq-card').style.display = 'none';
        }
    }
};

// ============================================================
// 14. NUMBER BASE CONVERTER
// ============================================================
DevLoft.base = {
    convert() {
        const input = document.getElementById('base-input').value.trim();
        const fromBase = parseInt(document.getElementById('base-from').value);
        if (!input) {
            ['base-dec', 'base-hex', 'base-oct', 'base-bin'].forEach(id => document.getElementById(id).textContent = '—');
            return;
        }
        try {
            const num = parseInt(input, fromBase);
            if (isNaN(num)) throw new Error('Invalid number');
            document.getElementById('base-dec').textContent = num.toString(10);
            document.getElementById('base-hex').textContent = '0x' + num.toString(16).toUpperCase();
            document.getElementById('base-oct').textContent = '0o' + num.toString(8);
            document.getElementById('base-bin').textContent = '0b' + num.toString(2);
        } catch (e) {
            ['base-dec', 'base-hex', 'base-oct', 'base-bin'].forEach(id => document.getElementById(id).textContent = '❌ Invalid');
        }
    },
    loadSample() {
        document.getElementById('base-from').value = '10';
        document.getElementById('base-input').value = '255';
        this.convert();
    }
};

// ============================================================
// 15. COLOR CONVERTER
// ============================================================
DevLoft.color = {
    _update(r, g, b, source) {
        const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
        const [h, s, l] = this._rgbToHsl(r, g, b);
        const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
        const rgbStr = `rgb(${r}, ${g}, ${b})`;

        document.getElementById('color-swatch').style.background = hex;
        document.getElementById('color-picker').value = hex;
        document.getElementById('color-val-hex').textContent = hex;
        document.getElementById('color-val-rgb').textContent = rgbStr;
        document.getElementById('color-val-hsl').textContent = hslStr;

        if (source !== 'hex') document.getElementById('color-hex').value = hex;
        if (source !== 'rgb') document.getElementById('color-rgb').value = rgbStr;
        if (source !== 'hsl') document.getElementById('color-hsl').value = hslStr;
    },
    fromPicker() {
        const hex = document.getElementById('color-picker').value;
        const [r, g, b] = this._hexToRgb(hex);
        if (r !== null) this._update(r, g, b, 'picker');
    },
    fromHex() {
        const hex = document.getElementById('color-hex').value.trim();
        const [r, g, b] = this._hexToRgb(hex);
        if (r !== null) this._update(r, g, b, 'hex');
    },
    fromRgb() {
        const val = document.getElementById('color-rgb').value.trim();
        const m = val.match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
        if (m) {
            const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
            if (r <= 255 && g <= 255 && b <= 255) this._update(r, g, b, 'rgb');
        }
    },
    fromHsl() {
        const val = document.getElementById('color-hsl').value.trim();
        const m = val.match(/(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/);
        if (m) {
            const [h, s, l] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
            const [r, g, b] = this._hslToRgb(h, s, l);
            this._update(r, g, b, 'hsl');
        }
    },
    _hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) return [null, null, null];
        return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
    },
    _rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / d + 2) / 6;
            else h = ((r - g) / d + 4) / 6;
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    },
    _hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
    loadSample() {
        const samples = ['#FF5733', '#2ECC71', '#3498DB', '#9B59B6', '#F1C40F'];
        const hex = samples[Math.floor(Math.random() * samples.length)];
        document.getElementById('color-hex').value = hex;
        this.fromHex();
    }
};

// ============================================================
// TOOLS PAGE — Navigation & Routing
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tool]');
    const toolSections = document.querySelectorAll('.tool-section');
    const toolsLayout = document.getElementById('toolsLayout');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');

    function activateTool(toolId) {
        toolSections.forEach(s => s.classList.remove('active'));
        sidebarLinks.forEach(l => l.classList.remove('active'));

        const section = document.getElementById(toolId);
        const link = document.querySelector(`[data-tool="${toolId}"]`);
        if (section) section.classList.add('active');
        if (link) link.classList.add('active');

        // Close mobile sidebar
        if (toolsLayout && toolsLayout.classList.contains('sidebar-open')) {
            toolsLayout.classList.remove('sidebar-open');
        }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const toolId = this.getAttribute('data-tool');
            activateTool(toolId);
            window.location.hash = toolId;
        });
    });

    // Handle hash on load
    if (window.location.hash) {
        const toolId = window.location.hash.substring(1);
        activateTool(toolId);
    }

    // Sidebar toggle (desktop)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            toolsLayout.classList.toggle('sidebar-collapsed');
        });
    }

    // Mobile toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            toolsLayout.classList.toggle('sidebar-open');
        });
    }

    // Auto-calculate on date change
    const dateStart = document.getElementById('date-start');
    const dateEnd = document.getElementById('date-end');
    if (dateStart && dateEnd) {
        dateStart.addEventListener('change', () => DevLoft.date.calculate());
        dateEnd.addEventListener('change', () => DevLoft.date.calculate());
    }

    // Auto-convert markdown on input
    const mdInput = document.getElementById('md-input');
    if (mdInput) {
        mdInput.addEventListener('input', () => DevLoft.md.convert());
    }
});
