# 💊 RxGuard — Drug Interaction Analyzer

A production-ready drug interaction analyzer built for hackathons. Features a stunning dark UI, MongoDB database, and clinical-grade interaction data.

---

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env if needed (MongoDB URI, port)
```

### 3. Start MongoDB
Make sure MongoDB is running locally:
```bash
# Mac (Homebrew)
brew services start mongodb/brew/mongodb-community

# Ubuntu/Linux
sudo service mongod start

# Windows
net start MongoDB
```

### 4. Seed the Database
```bash
node seed.js
```
This populates 23 drugs and 18 interaction records.

### 5. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 6. Open in Browser
```
http://localhost:3000
```

---

## 🏗️ Project Structure

```
drug-analyzer/
├── server.js          ← Main Express server
├── seed.js            ← Database seeder
├── package.json
├── .env.example
├── models/
│   ├── Drug.js        ← Drug MongoDB schema
│   ├── Interaction.js ← Interaction schema
│   └── SearchHistory.js
├── routes/
│   └── api.js         ← All API endpoints
├── data/
│   └── drugData.js    ← Clinical interaction database
└── public/
    ├── index.html     ← Frontend (single page)
    ├── css/style.css  ← All styling
    └── js/app.js      ← Frontend logic
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drugs` | List all drugs |
| GET | `/api/drugs/search?q=warfarin` | Autocomplete search |
| POST | `/api/interactions/check` | Check interactions |
| GET | `/api/stats` | Dashboard statistics |

### Example: Check Interaction
```bash
curl -X POST http://localhost:3000/api/interactions/check \
  -H "Content-Type: application/json" \
  -d '{"drugs": ["warfarin", "aspirin"]}'
```

---

## ⚕ Features

- 🔍 **Autocomplete Search** — Find drugs by name or brand
- ⚡ **Severity Ratings** — None / Minor / Moderate / Major / Contraindicated
- 🔬 **Mechanism Explanations** — Understand WHY interactions occur
- 💊 **Clinical Effects** — See what symptoms to expect
- 🩺 **Management Guidance** — What to do if combination is necessary
- 📊 **Live Stats Dashboard** — Database metrics
- 💾 **MongoDB Storage** — Persistent search history
- 🛡️ **Rate Limiting** — API protection built-in

---

## 🌟 Hackathon Tips

1. **Demo flow**: Type "Warfarin" + "Aspirin" → major interaction
2. **Impressive combo**: "Fluoxetine" + "Tramadol" → serotonin syndrome warning
3. **Safe example**: "Paracetamol" + "Ibuprofen" → safe combination
4. **CONTRAINDICATED**: "SSRI" + "MAOI" → life-threatening warning

---

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM
- **Fonts**: Syne (headings) + DM Sans (body)
