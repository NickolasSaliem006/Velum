# CLAUDE.md — Personal AI Assistant System

> Reference file for agentic coding tools. Every module in the project should be
> built according to the rules, schemas, and architecture described here.

---

## What This Project Is

A 24/7 personal AI assistant running locally on a Windows 11 PC. It automates
job hunting across Chinese and international platforms, tracks university
assignment deadlines, scans Indonesia-China business opportunities, and
surfaces everything through a local dashboard with human-in-the-loop approval.

**Owner:** Nickolas Saliem — Year 2 Electronic & Computer Engineering, ZJU
International Campus (ZJUI). Indonesian student in China.

---

## Hardware

| Component | Spec |
|-----------|------|
| GPU | RTX 5060 Ti 16 GB VRAM |
| CPU | Intel Ultra 7 265KF |
| OS | Windows 11 |
| Storage | SSD |
| Local LLM | LM Studio @ `http://localhost:1234/v1` |
| LLM Model | `qwen/qwen3.5-9b` (text + vision, same model for both) |

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Language | Python 3.12+ |
| Browser automation | Playwright (async, Chromium) |
| Scheduling | APScheduler |
| Web framework | FastAPI + Jinja2 + HTMX |
| Database | SQLite via `aiosqlite` (single file: `data/assistant.db`) |
| LLM client | `httpx` → LM Studio OpenAI-compatible API |
| Notifications | `win10toast-click`, Rainmeter, optional WeChat |
| Desktop widget | Rainmeter (reads JSON written by the system) |

---

## Project Structure

```
ai_assistant/
├── main.py                  # Entry point — APScheduler wiring
├── config.py                # THE single source of truth for all settings ✅ DONE
├── database.py              # SQLite schema, connection helper, query functions
├── scrapers/
│   ├── boss_zhipin.py       # Boss直聘 scraper
│   ├── liepin.py            # 猎聘 scraper
│   ├── job51.py             # 51Job scraper
│   ├── linkedin.py          # LinkedIn scraper
│   ├── shixiseng.py         # 实习僧 scraper
│   ├── assignments.py       # University LMS scraper (Cengage, zjuilearn, Blackboard)
│   └── opportunities.py     # Business / exhibition / trade scraper
├── ai/
│   ├── engine.py            # LM Studio API wrapper (prompt → JSON)
│   ├── job_scorer.py        # Score jobs 1–10, decide apply/maybe/skip
│   ├── cover_letter.py      # Generate tailored cover letters
│   └── opportunity.py       # Score business opportunities
├── automation/
│   ├── applicator.py        # Auto-fill job applications (REQUIRES human approval)
│   └── registrar.py         # Auto-register for events / exhibitions
├── notifications/
│   ├── toast.py             # Windows toast notifications (win10toast-click)
│   ├── rainmeter.py         # Write JSON data for Rainmeter desktop skin
│   └── digest.py            # Daily summary digest
├── dashboard/
│   ├── app.py               # FastAPI server on localhost:8080
│   ├── templates/           # Jinja2 + HTMX templates
│   └── static/              # CSS, JS
├── data/
│   ├── profile.json         # Nickolas's resume data (structured JSON)
│   ├── cv.pdf               # Current CV file
│   ├── screenshots/         # Playwright debug screenshots by date
│   ├── rainmeter_data.json  # Written by system, read by Rainmeter
│   └── assistant.db         # SQLite database
└── logs/
    └── assistant.log        # Rotating log file (30-day retention)
```

---

## Owner Profile (for AI context)

Use this when the LLM needs context for job scoring or cover letter writing.

```
Name:           Nickolas Saliem
Email:          nickolassaliem18@gmail.com
Phone (CN):     +86-187-2573-0837
Phone (ID):     +62-857-7357-5542
WeChat:         nickolassaliem18
LinkedIn:       https://www.linkedin.com/in/nickolas-saliem-ab4711264/
GitHub:         https://github.com/NickolasSaliem006

University:     Zhejiang University — ZJUI International Campus
Major:          Electronic & Computer Engineering (B.Eng)
Year:           2
GPA:            3.89 / 4.00
Graduation:     June 2028
Nationality:    Indonesian
Location:       Haining, China

Languages:      English (Fluent), Chinese/Mandarin (Conversational), Indonesian (Native)

Skills:         C, C++, Python, Assembly, HTML/CSS, Arduino, LTSpice,
                HFSS (antenna sim), EV systems, BMS, VCU, IC design,
                product design, leadership, public speaking

Experience:
  1. EV Engineering Trainee — Suzhou Industrial Park Vocational Univ (June 2025, 30 days)
     Motors, BMS, VCU, wiring. Translation support for Indonesian trainees.
  2. Co-Founder & Hardware Lead — Thrift Tech / @thrifttech.id (2023–2024)
     Led 10-person team. Arduino-based "Trash Buster" RC garbage collector.
  3. Web Developer — Government Task Control Management Project (2023)
     HTML/CSS web software for ministry task management.
  4. Research Assistant (SRTP) — Zhejiang University (2024–present)
     Metasurface design for RF applications using HFSS.

Target roles:   EV engineering, embedded systems, RF engineering, hardware,
                IoT, automation, firmware, chip design, software engineering internships
Target cities:  杭州 上海 苏州 深圳 南京 北京 广州 成都
Include remote: Yes
```

---

## Module Specifications

### 1. Job Scraper — API-Based (NO Playwright)

**Decision:** Replaced all Playwright web scrapers with free REST APIs.
Playwright job scrapers were blocked by anti-bot systems on Boss直聘, 猎聘, etc.

**Primary source:** JSearch API via RapidAPI (free tier: 500 req/month)
- Aggregates LinkedIn, Indeed, Glassdoor, and more
- Returns clean JSON — no browser, no login, no CAPTCHA
- File: `scrapers/jobs_api.py`
- API key stored in `config.API_KEYS["jsearch"]`
- RapidAPI signup: rapidapi.com → search "JSearch" → subscribe free plan

**Schedule:** Daily at 07:00 local
**Storage:** `jobs` table in SQLite
**Dedup key:** `url` unique constraint

```python
async def run_jobs_api_scraper() -> int  # returns new job count
```

**English keywords (23 terms):** embedded systems intern, hardware engineer intern,
EV engineering intern, RF engineer intern, IoT intern, electronics engineer intern,
firmware engineer intern, circuit design intern, software engineer intern,
software development intern, systems software intern, driver software intern,
NVIDIA intern China, ARM intern, ASML intern, chip design intern, semiconductor intern,
VLSI intern, ByteDance software intern, TikTok intern, remote embedded intern,
online internship software engineer, virtual internship hardware

**Search locations:** China, Remote (to capture both China-based and online roles)

**Target companies (AI score boost):**
- Tier 1 — global semi/hardware: NVIDIA, ARM, ASML, Qualcomm, Intel, AMD, TI, Infineon, NXP, ST, Broadcom, MediaTek, TSMC
- Tier 2 — China big tech: ByteDance, TikTok, Tencent, Alibaba, Baidu, Huawei, Xiaomi, DJI, OPPO, vivo, Meituan, NetEase, JD, Didi
- Tier 3 — China EV/hardware: BYD, NIO, Li Auto, Xpeng, CATL, SAIC, Geely, Hikvision, Dahua, ZTE, iFlytek, SenseTime

**Playwright job scrapers (boss_zhipin.py, liepin.py, job51.py, shixiseng.py):**
Kept in `scrapers/` folder for reference but NOT used in the pipeline.
Replaced entirely by `scrapers/jobs_api.py`.

### 2. AI Job Filter

**Endpoint:** `POST http://localhost:1234/v1/chat/completions`
**Model:** `qwen/qwen3.5-9b`
**Schedule:** Daily at 07:30 (after scraper)

**LLM settings (from `config.LM_STUDIO`):**
- `temperature: 0.5` for scoring (override to 0.7 for cover letters)
- `max_tokens: 50000`
- `timeout_score: 600` s
- `timeout_cover_letter: 600` s
- `timeout_vision: 300` s

**Required output JSON:**
```json
{
  "score": 7,
  "reason": "Embedded systems role matching EV + IoT skills",
  "action": "apply",
  "tips": "Mention Suzhou EV training in cover letter"
}
```
- `score`: integer 1–10
- `action`: exactly `"apply"` | `"maybe"` | `"skip"`

**System prompt rule:** Always include `"Respond in JSON only. No markdown, no explanation, no preamble."` in every LLM call that expects structured output.

### 3. Auto-Apply

- Uses Playwright to fill forms from `config.PROFILE` data
- **NEVER auto-submit. Always pause for human approval.**
- Flow: prefill → screenshot → toast notification → user reviews in dashboard → approve/reject

### 4. Assignment Monitor

**Schedule:** Every 6 hours
**Storage:** `assignments` table in SQLite
**Dedup key:** `(platform, assignment_id)` unique constraint

#### Platforms

| Platform | URL | Auth Method |
|----------|-----|-------------|
| **Cengage** (MindTap/WebAssign) | `https://www.cengage.com` | SSO or email/password login |
| **ZJU iLearn** | `https://zjuilearn.com.cn` | ZJU unified auth (学号 + password) via CAS |
| **Blackboard** | ZJU Blackboard instance | ZJU unified auth via CAS |

#### ZJU Authentication Flow
1. Navigate to `https://zjuam.zju.edu.cn/cas/login`
2. Fill 学号 (student ID) + password from `config.CREDENTIALS["zju_lms"]`
3. Submit → follow 302 redirect chain → land on LMS (`https://courses.zju.edu.cn`)
4. Session cookies are now set — navigate to each platform

#### Data Schema per Assignment
```python
{
    "platform":       str,   # "cengage" | "zjuilearn" | "blackboard"
    "assignment_id":  str,   # platform-specific unique ID
    "course_name":    str,   # e.g. "ECE 101 Digital Logic"
    "assignment_name": str,  # e.g. "Homework 3: Boolean Algebra"
    "due_date":       str,   # ISO 8601, Asia/Shanghai timezone
    "status":         str,   # "pending" | "submitted" | "completed" | "overdue"
    "url":            str,   # direct link to the assignment page
    "description":    str,   # optional — extra instructions
    "attached_files": list,  # optional — list of attachment filenames
}
```

#### Deadline Notification Escalation
- **48 hours** before due → first alert (informational)
- **24 hours** before due → second alert (urgent tone)
- **6 hours** before due → final warning (critical)

#### Platform-Specific Scraping Notes

**Cengage:**
- Login may redirect through institutional SSO
- MindTap content loads inside iframes — navigate into the iframe to find assignments
- Look for assignment lists, due dates, and completion status
- WebAssign may have a separate assignment interface

**ZJU iLearn (`zjuilearn.com.cn`):**
- Custom ZJU platform, not a standard LMS
- After CAS auth, scrape course pages for homework/assignment sections
- Parse course list → enter each course → find assignment/homework tab → extract details
- Date formats may be Chinese (e.g. "2025年3月15日 23:59")

**Blackboard:**
- Check for REST API availability: `GET /learn/api/public/v1/` — if accessible, prefer API over scraping
- API endpoints of interest:
  - `/learn/api/public/v1/courses` — list enrolled courses
  - `/learn/api/public/v1/courses/{courseId}/contents` — course content items
  - `/learn/api/public/v1/courses/{courseId}/gradebook/columns` — assignments with due dates
- If API is locked down, fall back to Playwright scraping of the web interface
- After CAS login, Blackboard session is available — navigate to "My Courses" → each course → assignments

### 5. Business Scanner — API-Based (NO Playwright)

**Decision:** Replaced web scraping with free news APIs.

**Sources:**
- NewsAPI (newsapi.org) — free 100 req/day, English news
- GNews API (gnews.io) — free 100 req/day, multilingual
- File: `scrapers/opportunities.py`
- API keys in `config.API_KEYS["newsapi"]` and `config.API_KEYS["gnews"]`

**Schedule:** Daily at 08:00
**Keywords:** 28 terms in EN+CN covering Indonesia-China trade, EV exhibitions, startup competitions, subsidies, talent policies

**Required output JSON:**
```json
{
  "relevance": 8,
  "category": "exhibition",
  "summary": "Canton Fair spring session opens April 15. Strong EV and electronics presence expected.",
  "action_needed": "register"
}
```
- `relevance`: integer 1–10
- `category`: `"exhibition"` | `"news"` | `"event"` | `"subsidy"` | `"competition"`
- `action_needed`: `"register"` | `"attend"` | `"research"` | `"ignore"`

### 6. Notification System

- **Toast:** `win10toast-click`, 8-second display, clickable (opens dashboard)
- **Rainmeter:** writes `data/rainmeter_data.json` (disabled by default)
- **Thresholds:** jobs with AI score ≥ 6, opportunities with relevance ≥ 7

### 7. Dashboard

- **URL:** `http://localhost:8080` (bound to `127.0.0.1` only)
- **Stack:** FastAPI + Jinja2 + HTMX
- **Dev mode:** `reload: True`
- **Pages:** job queue, assignment calendar, opportunity feed, approve/reject applications, settings

---

## Scheduler Summary

| Task | Trigger | Time / Interval |
|------|---------|-----------------|
| Job scraping | Cron | 07:00 daily |
| AI job scoring | Cron | 07:30 daily |
| Assignment check | Interval | Every 6 hours |
| Business scan | Cron | 08:00 daily |
| Daily digest | Cron | 09:00 daily |
| Deadline alerts | Continuous | 48h / 24h / 6h before due |

All times: Asia/Shanghai (UTC+8).

---

## Coding Standards

### Python Style
- Python 3.12+ — use modern syntax (`match`, type aliases)
- Type hints on **every** function signature and return type
- Google-style docstrings on every public function
- `async/await` for all I/O: Playwright, httpx, aiosqlite, file writes
- No `print()` — use `logging` module exclusively

### Error Handling
- Wrap all I/O in `try/except` with `logging.exception()`
- Never crash silently — log the traceback, then continue
- Scrapers are fault-tolerant: one platform failing does NOT block others
- LLM parse failures: retry once with stricter "JSON only" prompt

### Database
- SQLite via `aiosqlite` — async access
- All schema in `database.py`
- **Parameterized queries only** — never f-string SQL
- Dedup with `INSERT OR IGNORE` on composite unique keys

### LLM Calls (`ai/engine.py`)
- POST `http://localhost:1234/v1/chat/completions`
- System prompt always includes: `"Respond in JSON only. No markdown, no explanation."`
- `temperature: 0.5` for scoring, `0.7` for creative (cover letters)
- Parse with `json.loads()`; catch `json.JSONDecodeError`, retry once
- If LM Studio is offline: queue items for later — never block the pipeline

### Logging
- Python `logging` to console + `logs/assistant.log`
- Rotating daily, 30-day retention
- `DEBUG` while developing, `INFO` in production

### Secrets & Config
- `config.py` is the single source of truth — no hardcoded values in other files
- Credentials in `config.CREDENTIALS` (local machine only)
- For extra safety: `.env` file + `python-dotenv`
- **Never commit credentials to git**

### .gitignore
```
data/assistant.db
data/cv.pdf
data/profile.json
data/screenshots/
data/rainmeter_data.json
logs/
.env
__pycache__/
*.pyc
```

---

## Build Order

Build and test each part individually before moving to the next.

```
Phase 1 — Foundation
  1. config.py                              ✅ DONE
  2. database.py                            ✅ DONE (sync sqlite3; aiosqlite migration later)

Phase 2 — LLM Integration
  3. ai/engine.py                           → verify LM Studio round trip

Phase 3 — Assignment Tracking (PRIORITY — university sites easier than job sites)
  4. scrapers/assignments.py               → Cengage + zjuilearn + Blackboard (Playwright)

Phase 4 — Job Pipeline via API (replaces all Playwright job scrapers)
  5. scrapers/jobs_api.py                  → JSearch API client (needs RapidAPI key)
  6. ai/job_scorer.py                      ✅ DONE

Phase 5 — Business Intelligence via API
  7. scrapers/opportunities.py             → NewsAPI + GNews client (needs API keys)

Phase 6 — Notifications
  8. notifications/toast.py               → Windows toast alerts

Phase 7 — Dashboard  (retired Playwright scrapers kept for reference, not used)
  scrapers/boss_zhipin.py                  ✅ DONE (retired — reference only)
  scrapers/liepin.py                       ✅ DONE (retired — reference only)
  scrapers/job51.py                        ✅ DONE (retired — reference only)
  scrapers/shixiseng.py                    ✅ DONE (retired — reference only)

Phase 7 — Dashboard
  13. dashboard/app.py + templates + static

Phase 8 — Automation
  14. automation/applicator.py              → auto-fill with human approval

Phase 9 — Polish & Integration
  15. notifications/rainmeter.py
  16. notifications/digest.py
  17. main.py                               → APScheduler, full system wiring
```

---

## Common Commands

```bash
# Install all dependencies
pip install playwright httpx fastapi uvicorn jinja2 apscheduler aiosqlite win10toast-click python-dotenv

# Install Playwright browser
playwright install chromium

# Run the full system
python main.py

# Run dashboard only (dev)
uvicorn dashboard.app:app --host 127.0.0.1 --port 8080 --reload

# Test a single scraper
python -m scrapers.boss_zhipin

# Inspect database
sqlite3 data/assistant.db ".tables"
sqlite3 data/assistant.db "SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;"
sqlite3 data/assistant.db "SELECT * FROM assignments WHERE status='pending' ORDER BY due_date;"
```

---

## LLM Prompt Templates

### Job Scoring
```
You are a job-matching AI. Given a job posting and a candidate profile,
score how well the job fits the candidate.

Candidate: {insert PROFILE summary}

Job posting:
Title: {job_title}
Company: {company}
Location: {location}
Description: {job_description}

Respond in JSON only. No markdown, no explanation, no preamble.
{"score": <1-10>, "reason": "<one sentence>", "action": "<apply/maybe/skip>", "tips": "<one tip>"}
```

### Business Opportunity Scoring
```
You are a business opportunity analyzer for an Indonesian student in China
interested in Indonesia-China trade, EV industry, and startup competitions.

Opportunity:
Title: {title}
Description: {description}
Source: {source_url}

Respond in JSON only. No markdown, no explanation, no preamble.
{"relevance": <1-10>, "category": "<exhibition/news/event/subsidy/competition>", "summary": "<two sentences>", "action_needed": "<register/attend/research/ignore>"}
```

---

## Key Constraints

1. **Human-in-the-loop:** Auto-apply NEVER submits without explicit user approval
2. **Rate limiting:** 2–5s delays between requests to avoid bans
3. **Bilingual:** Job descriptions are often Chinese; LLM must handle both EN and CN
4. **Timezone:** All datetimes in Asia/Shanghai (UTC+8)
5. **Offline resilience:** LM Studio down → queue for later, don't block pipeline
6. **Fault isolation:** One scraper crash must NOT prevent others from running
7. **Incremental:** Build one module → test it → move on
8. **Config is king:** All settings come from `config.py` — no magic numbers in module code
9. **Scraper fallback policy:** If DOM extraction fails → screenshot + vision AI. If a job site is repeatedly blocked or broken after 3 attempts → skip it and move on to the next site. Never let one broken scraper hang the entire pipeline.
