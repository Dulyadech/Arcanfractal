# TODO — Arcanfractal Implementation Roadmap

> **Source of Truth:** [`SDD.md`](file:///c:/Users/Acer/Documents/Coding/Project/tarot-tajai/SDD.md)
> **Status:** 0% implementation — ยังไม่มี code ใดๆ
> **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion (SDD §7.1)
> **Project Name:** Arcanfractal

---

## Open Questions / Decisions

> ต้องตัดสินใจก่อนหรือระหว่าง implementation — ห้ามเดาเอง

### ~~Q-001 — ชื่อโปรเจกต์อย่างเป็นทางการ~~ ✅ Resolved

- Type: DECISION
- **Decision: Arcanfractal**
- Status: Resolved

### ~~Q-002 — ค่าเริ่มต้นของ Reversed Cards toggle~~ ✅ Resolved

- Type: DECISION
- **Decision: Off (ปิด) เป็นค่าเริ่มต้น**
- Status: Resolved

### Q-003 — เบอร์สายด่วนวิกฤต (Crisis Hotline)

- Type: DECISION
- Related SDD: §3 Feature "Crisis Safety Support", §11 Open Question #3
- Problem: ใช้เบอร์ 1323 (ไทย) fix ตายตัว หรือเปลี่ยนตาม locale?
- Options:
  - Option A: Fix 1323 (MVP เป็นภาษาไทยก่อน)
  - Option B: Locale-based mapping (ต้องเพิ่ม data structure)
- Required decision: ยืนยัน scope ภาษาของ MVP
- Blocking: No (Phase 6 — implement crisis panel ทีหลังได้)

### ~~Q-004 — POST /api/draw ดึงไพ่ทั้ง N ใบรอบเดียว vs ดึงทีละใบ~~ ✅ Resolved

- Type: CLARIFICATION
- **Decision: Option A — `/api/draw` สร้าง shuffled deck 78 ใบ → ส่ง deck กลับ client → client ให้ user เลือกตำแหน่งเอง → ส่งไพ่ที่เลือกครบไป `/api/interpret`**
- Status: Resolved — รองรับ True Index Selection ตาม SDD §4.2

### ~~Q-005 — รูปไพ่ 78 ใบ (Card Images)~~ ✅ Resolved

- Type: MISSING
- **Decision: ใช้รูปจาก [mixvlad/TarotCards](https://github.com/mixvlad/TarotCards/tree/main/tarot/rider-waite/full-png) (Rider-Waite-Smith PNG)**
- Note: ต้องแปลงเป็น WebP/AVIF 30-40 KB ตาม SDD §7.1 ในขั้น Phase 7
- Status: Resolved

---

## Assumptions

### ~~A-001 — ชื่อโปรเจกต์ชั่วคราว~~ ✅ Confirmed

- **Confirmed: Arcanfractal** (via Q-001)

### ~~A-002 — Q-004 ใช้ Option A (ส่ง shuffled deck กลับ client)~~ ✅ Confirmed

- **Confirmed: Option A** — `/api/draw` ส่ง shuffled deck ทั้ง 78 ใบกลับ client (via Q-004)

### ~~A-003 — Reversed Cards default Off~~ ✅ Confirmed

- **Confirmed: Off เป็นค่าเริ่มต้น** (via Q-002)

---

## Phase 0 — Project Setup & Tooling

**Goal:** สร้างโปรเจกต์ Next.js ที่รันได้ พร้อม tooling ครบ ยังไม่มี feature ใดๆ

### Tasks

- [x] Initialize Next.js project (App Router) with TypeScript (`create-next-app`)
- [x] ตั้งค่า Tailwind CSS พร้อม design tokens ตาม SDD §6.1 (สี, font, responsive breakpoints)
- [x] ติดตั้ง dependencies: Radix UI, Lucide React, Framer Motion (SDD §7.1)
- [x] ตั้งค่า ESLint + Prettier
- [x] สร้าง folder structure เบื้องต้น (`app/`, `lib/`, `components/`, `data/`, `types/`)
- [x] สร้าง `.env.example` สำหรับ API keys (KKU IntelliShare, Gemini — SDD §7.1)
- [x] ตั้งค่า path aliases (`@/`)

### Verification

- [ ] `pnpm dev` สำเร็จ เปิดหน้าเว็บว่างได้
- [x] Tailwind classes ทำงานถูกต้อง (สี background/text ตรงตาม design tokens)
- [x] TypeScript compile ไม่มี error

### Done when

โปรเจกต์ Next.js ว่างเปล่ารันได้ พร้อม tooling ครบ ทำงานบน dev server สำเร็จ

---

## Phase 1 — Tarot Engine & Data Foundation

**Goal:** สร้าง Tarot Engine (Pure TypeScript) ที่สุ่มไพ่ถูกต้อง 100% + ข้อมูลไพ่ 78 ใบครบถ้วน — ยังไม่มี UI (SDD §4, §8, §10 Phase 1)

### Tasks

- [ ] สร้าง TypeScript types/interfaces ตาม SDD §8 Data Model: `TarotCard`, `DrawnCard`, `ReadingRecord`, `ReadingAnalysis`, `AIInterpretationPayload` (§5.2)
- [ ] สร้าง Spread types + position definitions ตาม SDD §4.5 ครบทั้ง 4 spreads (`single`, `three-timeline`, `three-guidance`, `five-path`)
- [ ] สร้าง static deck catalog (ข้อมูลไพ่ 78 ใบ): id, slug, name, arcana, suit, number, element, keywords, meanings — ตาม SDD §3 "78-Card Deck Catalog" + §8
- [ ] Implement Fisher-Yates shuffle ด้วย Web Crypto API (`crypto.getRandomValues`) — SDD §4.1, §7.1 "ไร้ Modulo Bias"
- [ ] Implement reversed card randomization (50% ต่อใบ, อิสระต่อกัน) — SDD §3 "Reversed Cards"
- [ ] Implement Reading Analysis คำนวณ deterministic facts: majorCount/Ratio, dominantElement, repeatedRanks, courtCards, reversedRatio — SDD §4.6
- [ ] เขียน unit tests สำหรับ Tarot Engine:
  - Shuffle สร้าง permutation 78 ใบไม่ซ้ำ
  - ไม่มี modulo bias (distribution test)
  - Reversed randomization ~50%
  - No Duplicate Rule ภายใน reading
  - Analysis คำนวณถูกต้อง
  - Spread position keys ตรงกับ SDD §4.5

### Verification

- [ ] Unit tests ผ่าน 100%
- [ ] Deck catalog มีข้อมูลครบ 78 ใบ (22 Major + 56 Minor)
- [ ] Shuffle ผลิต 78 ใบไม่ซ้ำกันทุกรอบ
- [ ] Reading Analysis คืนค่าถูกต้องเมื่อให้ sample cards

### Done when

Tarot Engine เป็น Pure TypeScript module ที่ทำงานถูกต้อง มี tests ครบ สามารถ import ไปใช้ทั้ง client และ server ได้ ข้อมูลไพ่ 78 ใบครบถ้วน

---

## Phase 2 — Server API Routes

**Goal:** สร้าง API endpoints ทั้ง 3 ตัวตาม SDD §9 พร้อม rate limiting (SDD §10 Phase 3 บางส่วน)

### Tasks

- [ ] Implement `POST /api/draw` — สร้าง deck 78 ใบ + shuffle once + ส่ง shuffled deck ทั้ง 78 ใบกลับ client + คำนวณ analysis (SDD §9.1, Q-004 confirmed)
  - Request: `{ spreadId, reversedEnabled }`
  - Response: `{ drawId, spreadId, deck (shuffled 78 cards), analysis }`
- [ ] Implement `POST /api/interpret` — รับ drawn cards + question → เรียก AI → validate output → return หรือ fallback (SDD §9.2, §5)
  - Request: `{ drawId, question, spreadId, cards, analysis, locale }`
  - Response: `AIInterpretationPayload`
  - Implement Server Invariant Check: ตรวจว่าไพ่ที่ส่งมาตรงกับ drawId จริง (SDD §5 Guard)
- [ ] Implement `GET /api/health` — ตรวจสถานะระบบและ AI provider (SDD §9.3)
- [ ] Implement IP-based rate limiting สำหรับ API routes (SDD §3 "Rate Limiting", §7 architecture)
- [ ] Input validation ทุก endpoint: ตรวจ spreadId, cards, question length (5-500 chars — SDD §2)
- [ ] Error handling: คืน error response ที่ชัดเจนเมื่อ input ผิด / rate limit exceeded

### Verification

- [ ] `/api/draw` คืน shuffled deck ที่มีไพ่ 78 ใบไม่ซ้ำ + drawId ที่ unique
- [ ] `/api/interpret` คืน structured JSON ตาม `AIInterpretationPayload` schema
- [ ] `/api/health` คืนสถานะระบบ
- [ ] Rate limiter ปฏิเสธ request เกินกำหนด
- [ ] Invalid input ได้ error response ที่เหมาะสม

### Done when

API ทั้ง 3 endpoints ทำงานถูกต้อง มี validation + rate limiting + error handling ทดสอบผ่าน Postman/curl ได้

---

## Phase 3 — AI Integration & Fallback

**Goal:** เชื่อมต่อ AI Provider จริง + Fallback engine ให้การดูดวงสำเร็จเสมอ (SDD §5, §10 Phase 3)

### Tasks

- [ ] สร้าง AI Adapter abstraction รองรับ multi-provider (SDD §7 architecture: KKU IntelliShare primary, Gemini/OpenAI backup)
- [ ] Implement KKU IntelliShare integration (OpenAI-compatible format — SDD §7.1)
- [ ] Implement Gemini/OpenAI backup adapter
- [ ] สร้าง prompt template สำหรับ Tarot interpretation:
  - ส่ง drawn cards + positions + question + analysis
  - Enforce structured JSON output ตาม §5.2 schema
  - ใส่ข้อห้ามเด็ดขาด 3 ข้อ (§5.1): ห้ามเปลี่ยนไพ่, ห้ามเอ่ยไพ่อื่น, ห้ามทำนายเรื่องอันตราย
- [ ] Implement Output Validation (SDD §5 flowchart):
  - Schema validation ตาม `AIInterpretationPayload`
  - Undrawn Card Check: ตรวจว่า AI ไม่ได้เอ่ยไพ่ที่ไม่ได้จั่ว (Zero Hallucination Guard)
- [ ] Implement One-shot Self-Repair: หาก output หลุดกรอบ → ส่ง correction request 1 ครั้ง (SDD §5 flowchart)
- [ ] Implement Deterministic Fallback Engine: ประกอบคำทำนายจาก deck catalog meanings เมื่อ AI ล้มเหลว/timeout (SDD §3, §5, D6)
- [ ] Implement `safety` field detection ใน AI output: `"none" | "sensitive" | "crisis"` (SDD §5.2)

### Verification

- [ ] AI Adapter เรียก KKU IntelliShare สำเร็จ ได้ structured JSON กลับ
- [ ] Output validation ตรวจจับ hallucinated cards ได้ถูกต้อง
- [ ] Self-repair ทำงานเมื่อ output ครั้งแรกหลุดกรอบ
- [ ] Fallback engine สร้างคำทำนายจาก catalog ได้ทันทีเมื่อ AI ล่ม
- [ ] ReadingRecord.status = `"complete"` เมื่อ AI สำเร็จ, `"fallback"` เมื่อใช้ fallback

### Done when

AI Pipeline ทำงานครบ flow: call AI → validate → self-repair → fallback การดูดวงสำเร็จเสมอไม่ว่า AI จะล่มหรือไม่

---

## Phase 4 — Core UI: Question, Spread Selection & Shuffle

**Goal:** สร้างหน้าจอ 1-3 ของ ritual flow: Landing → Spread Selection → Shuffle animation (SDD §6.2, §2, §10 Phase 2)

### Tasks

- [ ] สร้าง layout หลักของ app: dark theme (Midnight Mysticism), responsive mobile-first 360px → desktop 1100px (SDD §6.1, §6.2)
- [ ] สร้างหน้า **Landing & Question** (`/`) — SDD §6.2 row 1:
  - ช่องกรอกคำถาม (5-500 chars validation)
  - Example prompts ให้กดเลือก
  - Question guidance แนะนำรูปประโยคเปิด (SDD §3 "Question Guidance")
  - ปุ่ม Continue
- [ ] สร้างหน้า **Spread Selection** (`/read?step=spread`) — SDD §6.2 row 2:
  - เลือก spread (1, 3, 5 ใบ) พร้อมแสดงชื่อและ position meanings (SDD §4.5)
  - Reversed Cards toggle switch (SDD §3 "Reversed Cards")
  - ปุ่ม Begin
- [ ] สร้างหน้า **Breathe & Shuffle** (`/read?step=shuffle`) — SDD §6.2 row 3:
  - Breathe/สมาธิ animation ~1.5s
  - Shuffle animation (แสดงการสับไพ่)
  - ปุ่ม Skip ได้
  - เรียก `POST /api/draw` ณ จุดนี้
- [ ] Implement Reading Lifecycle State Machine ใน client (SessionStorage) — SDD §7 architecture, §7.1:
  - States: `NEW → SHUFFLED → SELECTING → REVEALING → COMPLETE → INTERPRETING → RESULT`
  - เก็บ state ใน SessionStorage (SDD §7 "Flow State Machine")
- [ ] Route protection: ไม่ให้ข้ามขั้นตอน (เช่น ไปหน้า select โดยไม่ผ่าน shuffle)

### Verification

- [ ] User flow: พิมพ์คำถาม → เลือก spread → ดู shuffle animation → ได้ shuffled deck จาก API
- [ ] คำถามถูก validate (5-500 chars)
- [ ] Spread selection แสดง 4 options ถูกต้อง
- [ ] State machine transition ถูกต้องตามลำดับ
- [ ] กด Back/Refresh ไม่ทำให้ state หาย (SessionStorage)
- [ ] Mobile 360px ใช้งานได้ ปุ่มอยู่ใน thumb zone

### Done when

ผู้ใช้สามารถกรอกคำถาม เลือก spread ดู shuffle animation ได้ครบ 3 หน้าจอแรก state machine ทำงานถูกต้อง

---

## Phase 5 — Card Selection, Reveal & Result

**Goal:** สร้างหน้าจอหลักของพิธีกรรม: เลือกไพ่ → พลิกเปิดทีละใบ → แสดงผลคำทำนาย (SDD §2, §6.2, §10 Phase 2-3)

### Tasks

- [ ] สร้างหน้า **Card Selection & Reveal** (`/read?step=select`) — SDD §6.2 row 4:
  - แสดงไพ่คว่ำหน้า (card back) ให้ user แตะเลือก
  - Progressive Reveal: แตะ → พลิกเปิดไพ่ 180° ด้วย 3D CSS Transform + Framer Motion 60fps (SDD §3, §7.1)
  - ไพ่ที่เปิดแล้วแสดงชื่อ + รูป + orientation (upright/reversed)
  - ไพ่ที่เลือกแล้ว disabled (No Re-pick — SDD §4.2)
  - แสดง progress: เลือกแล้ว X/N ใบ
  - Reduced Motion: สลับเป็น fade animation เมื่อ `prefers-reduced-motion` (SDD §3)
- [ ] เมื่อเลือกครบ N ใบ → state = COMPLETE → auto-trigger `POST /api/interpret` (SDD §2 step 5)
- [ ] สร้างหน้า **Reading Result** (`/read?step=result`) — SDD §6.2 row 5:
  - แสดง overview (ภาพรวม)
  - แสดงไพ่แต่ละใบ + position name + interpretation
  - แสดง synthesis (การเชื่อมโยง)
  - แสดง advice (คำแนะนำ)
  - แสดง reflectionQuestion (คำถามชวนคิด)
  - Loading state ระหว่างรอ AI
  - Fallback UI: แสดงผลจาก deterministic fallback พร้อมบอก user ว่าเป็น fallback (status indicator)
- [ ] Implement **Copy as Text** — คัดลอกผลลัพธ์ทั้งหมดลง clipboard (SDD §3)
- [ ] ปุ่ม **New Reading** — reset state → กลับไป `/` เริ่มใหม่ (SDD §6.2, §7 lifecycle)
- [ ] สร้าง **Card Detail Sheet** (Modal/Bottom Sheet) — SDD §6.2 row 7:
  - แตะไพ่ในหน้า result → เปิด sheet แสดงความหมายฉบับเต็มจาก catalog
  - Radix UI Dialog/Sheet (SDD §7.1)

### Verification

- [ ] เลือกไพ่ทีละใบ animation พลิก 60fps ไม่กระตุก (ทดสอบบน mobile viewport 360px)
- [ ] ไพ่ที่เลือกแล้วกดซ้ำไม่ได้
- [ ] เลือกครบ → เรียก API interpret → แสดงผลลัพธ์ถูกต้องตาม schema
- [ ] Fallback ทำงานเมื่อ AI timeout/error
- [ ] Copy ได้ข้อความครบ
- [ ] Card Detail Sheet แสดงความหมาย upright/reversed ถูกต้อง
- [ ] Reduced Motion: animation เปลี่ยนเป็น fade เมื่อเปิด OS setting

### Done when

User flow ครบตั้งแต่เลือกไพ่ → เปิดทีละใบ → เห็นคำทำนาย → ดูรายละเอียดไพ่ → copy → ดูดวงใหม่ Core ritual experience ทำงานสมบูรณ์

---

## Phase 6 — History, Crisis Safety & Edge Cases

**Goal:** เพิ่มระบบประวัติ + ระบบความปลอดภัย + จัดการ edge cases (SDD §3, §10 Phase 4)

### Tasks

- [ ] Implement **Local Reading History** — SDD §3, §7.1:
  - บันทึก `ReadingRecord` ลง LocalStorage อัตโนมัติเมื่อดูดวงเสร็จ (SDD §8)
  - จำกัดสูงสุด 100 รายการ (SDD §3) — FIFO เมื่อเต็ม
  - ใช้ LocalStorage หรือ idb-keyval (SDD §7.1)
- [ ] สร้างหน้า **Reading History** (`/history`) — SDD §6.2 row 6:
  - แสดงรายการประวัติย้อนหลัง (วันที่, คำถาม, spread, ไพ่ที่ได้)
  - กดเปิดอ่านผลฉบับเต็ม
  - ลบประวัติรายการเดียวหรือทั้งหมด
- [ ] Implement **Crisis Safety Support** — SDD §3:
  - ตรวจจับคำถามที่อาจเป็นอันตราย (self-harm, suicide keywords)
  - แสดง Crisis Panel พร้อมเบอร์สายด่วน (ตาม Q-003 decision)
  - ไม่ block การใช้งาน แต่แสดง resource ช่วยเหลือ
  - ⚠️ Crisis detection ทำ client-side (keyword matching) — ไม่ส่งข้อมูลไป server
- [ ] Implement AI `safety` field handling (SDD §5.2):
  - `"crisis"` → แสดง crisis resources + คำทำนาย (ถ้ามี)
  - `"sensitive"` → แสดง disclaimer + คำทำนายปกติ
- [ ] Edge case: browser back/forward ระหว่าง ritual flow
- [ ] Edge case: SessionStorage หมดอายุ / ถูกเคลียร์ระหว่างดูดวง
- [ ] Edge case: network error ระหว่างเรียก API (แสดง error + retry option)

### Verification

- [ ] ดูดวงเสร็จ → ประวัติปรากฏใน `/history` ทันที
- [ ] ประวัติรายการที่ 101 ทำให้รายการเก่าสุดหายไป
- [ ] ลบประวัติแล้วข้อมูลหายจริง
- [ ] พิมพ์คำถามที่มี crisis keywords → เห็น Crisis Panel + เบอร์สายด่วน
- [ ] AI คืน `safety: "crisis"` → UI แสดง crisis resources
- [ ] Network error → แสดง error message + retry ไม่ crash

### Done when

ระบบประวัติทำงานครบ crisis safety ตรวจจับได้ edge cases สำคัญถูกจัดการ ไม่มีจุดที่ app crash โดยไม่แสดง error

---

## Phase 7 — Polish, Performance & Build

**Goal:** ขัดเกลา UX, optimized performance, เตรียม production build (SDD §10 Phase 5)

### Tasks

- [ ] จัดหา/เพิ่มรูปไพ่ 78 ใบ (Rider-Waite-Smith, WebP/AVIF, 30-40 KB/รูป — SDD §7.1) ← ขึ้นกับ Q-005
- [ ] รูป card back สำหรับไพ่คว่ำ
- [ ] Image optimization: next/image, lazy loading, responsive sizes
- [ ] Font loading optimization (Cinzel, Plus Jakarta Sans — SDD §6.1)
- [ ] Mobile UX review: ทดสอบบน viewport 360px จริง, thumb zone ของปุ่ม (SDD §6.1)
- [ ] Desktop layout: centered max-width 1100px (SDD §6.1)
- [ ] Accessibility basics: keyboard navigation, screen reader labels, focus management (Radix UI ช่วยส่วนหนึ่ง)
- [ ] Loading states ทุกจุดที่มี async operation
- [ ] SEO metadata: title, description, OG tags
- [ ] ตั้งค่า environment variables สำหรับ production (AI API keys)
- [ ] Production build สำเร็จ (`next build`)
- [ ] Deploy ขึ้น Vercel / Cloudflare Pages (SDD §7.1)

### Verification

- [ ] Lighthouse Performance score ≥ 80 บน mobile
- [ ] รูปไพ่โหลดถูกต้อง ไม่ broken
- [ ] Animation ลื่น 60fps บน mid-range mobile device
- [ ] ไม่มี layout shift (CLS ≤ 0.1)
- [ ] Build สำเร็จไม่มี error
- [ ] Deploy สำเร็จ เข้าถึงผ่าน URL ได้

### Done when

App build สำเร็จ deploy ขึ้น production ได้ รูปภาพครบ performance ดีบนมือถือ

---

## Phase 8 — Final Verification (SDD Compliance Check)

**Goal:** ตรวจสอบว่า implementation ครบตาม SDD ทุก requirement ก่อนถือว่าเสร็จ

### Tasks

- [ ] ทวนทุก MVP feature ใน SDD §3 ว่า implement ครบ:
  - [ ] Question Guidance
  - [ ] 78-Card Deck Catalog
  - [ ] Shuffle Once Engine
  - [ ] No Duplicate Rule
  - [ ] Progressive Card Reveal
  - [ ] 4 Core Spreads (single, three-timeline, three-guidance, five-path)
  - [ ] Reversed Cards (toggle + 50% random)
  - [ ] Grounded AI Interpretation (JSON Schema + Hallucination Guard)
  - [ ] Deterministic Fallback
  - [ ] Local Reading History (100 records)
  - [ ] Card Detail Sheet
  - [ ] Copy as Text
  - [ ] Crisis Safety Support
  - [ ] Rate Limiting
- [ ] ทวน Core User Flow (SDD §2): Question → Spread → Shuffle → Select & Reveal → Interpret → Result ครบ 6 ขั้นตอน
- [ ] ทวน Key Design Decisions (SDD §12):
  - [ ] D1: 1 Reading = 1 Deck (Shuffle Once) ✓
  - [ ] D2: True Index Selection & Progressive Reveal ✓
  - [ ] D3: Question ไม่มีผลต่อ Randomization ✓
  - [ ] D4: No Duplicate เฉพาะภายใน Reading ✓
  - [ ] D5: ไม่มี Login/Server DB ใน MVP ✓
  - [ ] D6: Deterministic Fallback ทำงานเสมอ ✓
  - [ ] D7: AI เป็นเพียง Interpreter ไม่เลือกไพ่เอง ✓
- [ ] ทวน AI Pipeline flow ครบ (SDD §5): Input → Guard → AI Call → Validation → Self-Repair → Fallback
- [ ] ทวน Reading Lifecycle State Machine ทำงานถูกต้อง (SDD §7)
- [ ] ทดสอบ: จำลอง AI ล่ม → fallback ทำงานสำเร็จ
- [ ] ทดสอบ: Mobile 360px user flow ทำงานครบจบ
- [ ] ทดสอบ: Error cases สำคัญ (network error, invalid input, rate limit)
- [ ] ไม่มี `[Future]` feature ถูก implement (SDD §3: User Accounts, Social Share, AI Chat, Celtic Cross)
- [ ] Open Questions (Q-001 ถึง Q-005) ได้รับการ resolve หรือมี assumption ที่ยอมรับได้
- [ ] Build สำเร็จ + Deploy สำเร็จ
- [ ] Final review เทียบกับ SDD ทุก section

### Done when

ทุก checkbox ใน Phase นี้ผ่าน — โปรเจกต์ถือว่า MVP complete ตาม SDD

---

## Phase Dependency Map

```text
Phase 0 (Setup)
  ↓
Phase 1 (Tarot Engine + Data)
  ↓
Phase 2 (Server API)
  ↓
Phase 3 (AI + Fallback)
  ↓
Phase 4 (UI: Question → Spread → Shuffle) ←── ใช้ API จาก Phase 2
  ↓
Phase 5 (UI: Select → Reveal → Result) ←── ใช้ AI จาก Phase 3
  ↓
Phase 6 (History + Crisis + Edge Cases)
  ↓
Phase 7 (Polish + Build + Deploy) ←── ขึ้นกับ Q-005 (รูปไพ่)
  ↓
Phase 8 (Final Verification)
```
