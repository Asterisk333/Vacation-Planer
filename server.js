import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const sanitize = s => (s || '').replace(/[^a-zA-Z0-9_\-]/g, '');

app.post('/save', (req, res) => {
    const { user, year, choices } = req.body || {};
    const safeUser = sanitize(user);
    const safeYear = String(year || '');
    if (!safeUser || !safeYear || !choices) return res.status(400).json({ error: 'Bad payload' });

    const filePath = path.join(dataDir, `${safeUser}_${safeYear}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ user: safeUser, year: safeYear, choices }, null, 2));
    res.json({ ok: true });
});

app.get('/load/:user/:year', (req, res) => {
    const user = sanitize(req.params.user);
    const year = sanitize(req.params.year);
    const filePath = path.join(dataDir, `${user}_${year}.json`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(data);
});

app.get('/users/:year', (req, res) => {
    const year = sanitize(req.params.year);
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith(`_${year}.json`));
    const users = files.map(f => f.replace(`_${year}.json`, ''));
    res.json({ year, users });
});

app.get('/aggregate/:year', (req, res) => {
    const year = sanitize(req.params.year);
    const requested = (req.query.users || '')
        .split(',')
        .map(s => sanitize(s))
        .filter(Boolean);

    let files = fs.readdirSync(dataDir).filter(f => f.endsWith(`_${year}.json`));
    if (requested.length) {
        const set = new Set(requested);
        files = files.filter(f => set.has(f.replace(`_${year}.json`, '')));
    }

    if (!files.length) return res.status(404).json({ error: 'Keine Daten gefunden' });

    const datasets = files.map(f => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf-8')));
    const users = datasets.map(d => d.user);

    const daysOfYear = (yr) => {
        const pad = (n) => String(n).padStart(2, '0');
        const dates = [];
        for (let m = 1; m <= 12; m++) {
            const dim = new Date(yr, m, 0).getDate();
            for (let d = 1; d <= dim; d++) dates.push(`${yr}-${pad(m)}-${pad(d)}`);
        }
        return dates;
    };

    const allDates = daysOfYear(Number(year));

    const perDay = {};
    for (const date of allDates) perDay[date] = { yes: 0, no: 0, maybe: 0 };

    for (const dset of datasets) {
        for (const date of allDates) {
            const v = (dset.choices && dset.choices[date]) || 'maybe';
            if (v === 'yes') perDay[date].yes++;
            else if (v === 'no') perDay[date].no++;
            else perDay[date].maybe++;
        }
    }

    const total = users.length;
    const status = {};
    for (const date of allDates) {
        const c = perDay[date];
        let s;
        if (c.no > 0) s = 'has_no';
        else if (c.yes === total) s = 'all_yes';
        else s = 'mixed';
        status[date] = s;
    }

    res.json({ year, users, total, perDay, status });
});

app.delete('/delete/:user/:year', (req, res) => {
    const user = sanitize(req.params.user);
    const year = sanitize(req.params.year);

    if (!user || !year) {
        return res.status(400).json({ error: "User oder Year fehlt" });
    }

    const filePath = path.join(dataDir, `${user}_${year}.json`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Datensatz nicht gefunden" });
    }

    // Datei entfernen
    try {
        fs.unlinkSync(filePath);
        return res.json({ ok: true, message: `Datensatz fuer ${user} wurde geloescht.` });
    } catch (err) {
        return res.status(500).json({ error: "Konnte Datei nicht loeschen." });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server laeuft auf", PORT));