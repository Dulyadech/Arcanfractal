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

### ~~Q-006 — กลไกการสุ่มและรีเซ็ตไพ่รายวัน (Daily Card Reset & Determinism)~~ ✅ Resolved

- Type: DECISION
- Related: `note.md` §1 Daily Card
- **Decision: Option A — Random draw ครั้งแรกของวันผ่าน Web Crypto API แล้วบันทึกลง LocalStorage (พร้อม timestamp และ lock ไว้จนถึง midnight ถัดไปของ local time)**
- Status: Resolved (Phase 9 Implementation)

### Q-007 — Endpoint และ Rate Limiting สำหรับ Follow-up Inquiries

- Type: DECISION / ARCHITECTURE
- Related: `note.md` §2 Interactive Follow-up Inquiries, SDD §3 "AI Follow-up Chat", SDD §8 & §9
- Problem: ฟังก์ชันถามต่อขยายจาก `/api/interpret` เดิม หรือสร้าง endpoint แยก เช่น `POST /api/interpret/follow-up`? และจำกัดจำนวนคำถามต่อ reading ไว้กี่คำถาม (Turn limit / Rate limit) เพื่อป้องกันการใช้งาน token เกินงบประมาณ?
- Options:
  - Option A: สร้าง endpoint แยก `POST /api/interpret/follow-up` พร้อมจำกัดจำนวนครั้ง (เช่น สูงสุด 3 คำถามต่อ reading)
  - Option B: ปรับ `POST /api/interpret` ให้รับ conversation history / previous synthesis
- Required decision: กำหนด endpoint schema, turn limit, และ model parameters
- Blocking: No (Phase 10 — Follow-up Inquiries)

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

- [x] `pnpm dev` สำเร็จ เปิดหน้าเว็บว่างได้
- [x] Tailwind classes ทำงานถูกต้อง (สี background/text ตรงตาม design tokens)
- [x] TypeScript compile ไม่มี error

### Done when

โปรเจกต์ Next.js ว่างเปล่ารันได้ พร้อม tooling ครบ ทำงานบน dev server สำเร็จ

---

## Phase 1 — Tarot Engine & Data Foundation

**Goal:** สร้าง Tarot Engine (Pure TypeScript) ที่สุ่มไพ่ถูกต้อง 100% + ข้อมูลไพ่ 78 ใบครบถ้วน — ยังไม่มี UI (SDD §4, §8, §10 Phase 1)

### Tasks

- [x] สร้าง TypeScript types/interfaces ตาม SDD §8 Data Model: `TarotCard`, `DrawnCard`, `ReadingRecord`, `ReadingAnalysis`, `AIInterpretationPayload` (§5.2)
- [x] สร้าง Spread types + position definitions ตาม SDD §4.5 ครบทั้ง 4 spreads (`single`, `three-timeline`, `three-guidance`, `five-path`)
- [x] สร้าง static deck catalog (ข้อมูลไพ่ 78 ใบ): id, slug, name, arcana, suit, number, element, keywords, meanings — ตาม SDD §3 "78-Card Deck Catalog" + §8
- [x] Implement Fisher-Yates shuffle ด้วย Web Crypto API (`crypto.getRandomValues`) — SDD §4.1, §7.1 "ไร้ Modulo Bias"
- [x] Implement reversed card randomization (50% ต่อใบ, อิสระต่อกัน) — SDD §3 "Reversed Cards"
- [x] Implement Reading Analysis คำนวณ deterministic facts: majorCount/Ratio, dominantElement, repeatedRanks, courtCards, reversedRatio — SDD §4.6
- [x] เขียน unit tests สำหรับ Tarot Engine:
  - [x] Shuffle สร้าง permutation 78 ใบไม่ซ้ำ
  - [x] ไม่มี modulo bias (distribution test)
  - [x] Reversed randomization ~50%
  - [x] No Duplicate Rule ภายใน reading
  - [x] Analysis คำนวณถูกต้อง
  - [x] Spread position keys ตรงกับ SDD §4.5

### Verification

- [x] Unit tests ผ่าน 100%
- [x] Deck catalog มีข้อมูลครบ 78 ใบ (22 Major + 56 Minor)
- [x] Shuffle ผลิต 78 ใบไม่ซ้ำกันทุกรอบ
- [x] Reading Analysis คืนค่าถูกต้องเมื่อให้ sample cards

### Done when

Tarot Engine เป็น Pure TypeScript module ที่ทำงานถูกต้อง มี tests ครบ สามารถ import ไปใช้ทั้ง client และ server ได้ ข้อมูลไพ่ 78 ใบครบถ้วน

---

## Phase 2 — Server API Routes

**Goal:** สร้าง API endpoints ทั้ง 3 ตัวตาม SDD §9 พร้อม rate limiting (SDD §10 Phase 3 บางส่วน)

### Tasks

- [x] Implement `POST /api/draw` — สร้าง deck 78 ใบ + shuffle once + ส่ง shuffled deck ทั้ง 78 ใบกลับ client + คำนวณ analysis (SDD §9.1, Q-004 confirmed)
  - Request: `{ spreadId, reversedEnabled }`
  - Response: `{ drawId, spreadId, deck (shuffled 78 cards), analysis }`
- [x] Implement `POST /api/interpret` — รับ drawn cards + question → เรียก AI → validate output → return หรือ fallback (SDD §9.2, §5)
  - Request: `{ drawId, question, spreadId, cards, analysis, locale }`
  - Response: `AIInterpretationPayload`
  - Implement Server Invariant Check: ตรวจว่าไพ่ที่ส่งมาตรงกับ drawId จริง (SDD §5 Guard)
- [x] Implement `GET /api/health` — ตรวจสถานะระบบและ AI provider (SDD §9.3)
- [x] Implement IP-based rate limiting สำหรับ API routes (SDD §3 "Rate Limiting", §7 architecture)
- [x] Input validation ทุก endpoint: ตรวจ spreadId, cards, question length (5-500 chars — SDD §2)
- [x] Error handling: คืน error response ที่ชัดเจนเมื่อ input ผิด / rate limit exceeded

### Verification

- [x] `/api/draw` คืน shuffled deck ที่มีไพ่ 78 ใบไม่ซ้ำ + drawId ที่ unique
- [x] `/api/interpret` คืน structured JSON ตาม `AIInterpretationPayload` schema
- [x] `/api/health` คืนสถานะระบบ
- [x] Rate limiter ปฏิเสธ request เกินกำหนด
- [x] Invalid input ได้ error response ที่เหมาะสม

### Done when

API ทั้ง 3 endpoints ทำงานถูกต้อง มี validation + rate limiting + error handling ทดสอบผ่าน Postman/curl ได้

---

## Phase 3 — AI Integration & Fallback

**Goal:** เชื่อมต่อ AI Provider จริง + Fallback engine ให้การดูดวงสำเร็จเสมอ (SDD §5, §10 Phase 3)

### Tasks

- [x] สร้าง AI Adapter abstraction รองรับ multi-provider (SDD §7 architecture: KKU IntelliShare primary, Gemini/OpenAI backup)
- [x] Implement KKU IntelliShare integration (OpenAI-compatible format — SDD §7.1)
- [x] Implement Gemini/OpenAI backup adapter
- [x] สร้าง prompt template สำหรับ Tarot interpretation:
  - ส่ง drawn cards + positions + question + analysis
  - Enforce structured JSON output ตาม §5.2 schema
  - ใส่ข้อห้ามเด็ดขาด 3 ข้อ (§5.1): ห้ามเปลี่ยนไพ่, ห้ามเอ่ยไพ่อื่น, ห้ามทำนายเรื่องอันตราย
- [x] Implement Output Validation (SDD §5 flowchart):
  - Schema validation ตาม `AIInterpretationPayload`
  - Undrawn Card Check: ตรวจว่า AI ไม่ได้เอ่ยไพ่ที่ไม่ได้จั่ว (Zero Hallucination Guard)
- [x] Implement One-shot Self-Repair: หาก output หลุดกรอบ → ส่ง correction request 1 ครั้ง (SDD §5 flowchart)
- [x] Implement Deterministic Fallback Engine: ประกอบคำทำนายจาก deck catalog meanings เมื่อ AI ล้มเหลว/timeout (SDD §3, §5, D6)
- [x] Implement `safety` field detection ใน AI output: `"none" | "sensitive" | "crisis"` (SDD §5.2)

### Verification

- [x] AI Adapter เรียก KKU IntelliShare สำเร็จ ได้ structured JSON กลับ (ทดสอบทั้ง OpenAI-compatible contract, response_format fallback, และ markdown parsing)
- [x] Output validation ตรวจจับ hallucinated cards ได้ถูกต้อง
- [x] Self-repair ทำงานเมื่อ output ครั้งแรกหลุดกรอบ
- [x] Fallback engine สร้างคำทำนายจาก catalog ได้ทันทีเมื่อ AI ล่ม
- [x] ReadingRecord.status = `"complete"` เมื่อ AI สำเร็จ, `"fallback"` เมื่อใช้ fallback

### Done when

AI Pipeline ทำงานครบ flow: call AI → validate → self-repair → fallback การดูดวงสำเร็จเสมอไม่ว่า AI จะล่มหรือไม่

---

## Phase 4 — Core UI: Question, Spread Selection & Shuffle

**Goal:** สร้างหน้าจอ 1-3 ของ ritual flow: Landing → Spread Selection → Shuffle animation (SDD §6.2, §2, §10 Phase 2)

### Tasks

- [x] สร้าง layout หลักของ app: dark theme (Midnight Mysticism), responsive mobile-first 360px → desktop 1100px (SDD §6.1, §6.2)
- [x] สร้างหน้า **Landing & Question** (`/`) — SDD §6.2 row 1:
  - ช่องกรอกคำถาม (5-500 chars validation)
  - Example prompts ให้กดเลือก
  - Question guidance แนะนำรูปประโยคเปิด (SDD §3 "Question Guidance")
  - ปุ่ม Continue
- [x] สร้างหน้า **Spread Selection** (`/read?step=spread`) — SDD §6.2 row 2:
  - เลือก spread (1, 3, 5 ใบ) พร้อมแสดงชื่อและ position meanings (SDD §4.5)
  - Reversed Cards toggle switch (SDD §3 "Reversed Cards")
  - ปุ่ม Begin
- [x] สร้างหน้า **Breathe & Shuffle** (`/read?step=shuffle`) — SDD §6.2 row 3:
  - Breathe/สมาธิ animation ~1.5s
  - Shuffle animation (แสดงการสับไพ่)
  - ปุ่ม Skip ได้
  - เรียก `POST /api/draw` ณ จุดนี้
- [x] Implement Reading Lifecycle State Machine ใน client (SessionStorage) — SDD §7 architecture, §7.1:
  - States: `NEW → SHUFFLED → SELECTING → REVEALING → COMPLETE → INTERPRETING → RESULT`
  - เก็บ state ใน SessionStorage (SDD §7 "Flow State Machine")
- [x] Route protection: ไม่ให้ข้ามขั้นตอน (เช่น ไปหน้า select โดยไม่ผ่าน shuffle)

### Verification

- [x] User flow: พิมพ์คำถาม → เลือก spread → ดู shuffle animation → ได้ shuffled deck จาก API
- [x] คำถามถูก validate (5-500 chars)
- [x] Spread selection แสดง 4 options ถูกต้อง
- [x] State machine transition ถูกต้องตามลำดับ
- [x] กด Back/Refresh ไม่ทำให้ state หาย (SessionStorage)
- [x] Mobile 360px ใช้งานได้ ปุ่มอยู่ใน thumb zone

### Done when

ผู้ใช้สามารถกรอกคำถาม เลือก spread ดู shuffle animation ได้ครบ 3 หน้าจอแรก state machine ทำงานถูกต้อง ✅ (Phase 4 Complete)

---

## Phase 5 — Card Selection, Reveal & Result

**Goal:** สร้างหน้าจอหลักของพิธีกรรม: เลือกไพ่ → พลิกเปิดทีละใบ → แสดงผลคำทำนาย (SDD §2, §6.2, §10 Phase 2-3)

### Tasks

- [x] สร้างหน้า **Card Selection & Reveal** (`/read?step=select`) — SDD §6.2 row 4:
  - แสดงไพ่คว่ำหน้า (card back) ให้ user แตะเลือก (พร้อมภาพไพ่ Rider-Waite จาก `mixvlad/TarotCards`)
  - Progressive Reveal: แตะ → พลิกเปิดไพ่ 180° ด้วย 3D CSS Transform + Framer Motion 60fps (SDD §3, §7.1)
  - ไพ่ที่เปิดแล้วแสดงชื่อ + รูป + orientation (upright/reversed)
  - ไพ่ที่เลือกแล้ว disabled (No Re-pick — SDD §4.2)
  - แสดง progress: เลือกแล้ว X/N ใบ
  - Reduced Motion: สลับเป็น fade animation เมื่อ `prefers-reduced-motion` (SDD §3)
- [x] เมื่อเลือกครบ N ใบ → state = COMPLETE → auto-trigger `POST /api/interpret` (SDD §2 step 5)
- [x] สร้างหน้า **Reading Result** (`/read?step=result`) — SDD §6.2 row 5:
  - แสดง overview (ภาพรวม)
  - แสดงไพ่แต่ละใบ + position name + interpretation
  - แสดง synthesis (การเชื่อมโยง)
  - แสดง advice (คำแนะนำ)
  - แสดง reflectionQuestion (คำถามชวนคิด)
  - Loading state ระหว่างรอ AI
  - Fallback UI: แสดงผลจาก deterministic fallback พร้อมบอก user ว่าเป็น fallback (status indicator)
- [x] Implement **Copy as Text** — คัดลอกผลลัพธ์ทั้งหมดลง clipboard (SDD §3)
- [x] ปุ่ม **New Reading** — reset state → กลับไป `/` เริ่มใหม่ (SDD §6.2, §7 lifecycle)
- [x] สร้าง **Card Detail Sheet** (Modal/Bottom Sheet) — SDD §6.2 row 7:
  - แตะไพ่ในหน้า result → เปิด sheet แสดงความหมายฉบับเต็มจาก catalog
  - Radix UI Dialog/Sheet (SDD §7.1)

### Verification

- [x] เลือกไพ่ทีละใบ animation พลิก 60fps ไม่กระตุก (ทดสอบบน mobile viewport 360px)
- [x] ไพ่ที่เลือกแล้วกดซ้ำไม่ได้
- [x] เลือกครบ → เรียก API interpret → แสดงผลลัพธ์ถูกต้องตาม schema
- [x] Fallback ทำงานเมื่อ AI timeout/error
- [x] Copy ได้ข้อความครบ
- [x] Card Detail Sheet แสดงความหมาย upright/reversed ถูกต้อง
- [x] Reduced Motion: animation เปลี่ยนเป็น fade เมื่อเปิด OS setting

### Done when

User flow ครบตั้งแต่เลือกไพ่ → เปิดทีละใบ → เห็นคำทำนาย → ดูรายละเอียดไพ่ → copy → ดูดวงใหม่ Core ritual experience ทำงานสมบูรณ์ ✅ (Phase 5 Complete)

---

## Phase 6 — History, Crisis Safety & Edge Cases

**Goal:** เพิ่มระบบประวัติ + ระบบความปลอดภัย + จัดการ edge cases (SDD §3, §10 Phase 4)

### Tasks

- [x] Implement **Local Reading History** — SDD §3, §7.1:
  - บันทึก `ReadingRecord` ลง LocalStorage อัตโนมัติเมื่อดูดวงเสร็จ (SDD §8)
  - จำกัดสูงสุด 100 รายการ (SDD §3) — FIFO เมื่อเต็ม
  - ใช้ LocalStorage หรือ idb-keyval (SDD §7.1)
- [x] สร้างหน้า **Reading History** (`/history`) — SDD §6.2 row 6:
  - แสดงรายการประวัติย้อนหลัง (วันที่, คำถาม, spread, ไพ่ที่ได้)
  - กดเปิดอ่านผลฉบับเต็ม
  - ลบประวัติรายการเดียวหรือทั้งหมด
- [x] Implement **Crisis Safety Support** — SDD §3:
  - ตรวจจับคำถามที่อาจเป็นอันตราย (self-harm, suicide keywords)
  - แสดง Crisis Panel พร้อมเบอร์สายด่วน (ตาม Q-003 decision)
  - ไม่ block การใช้งาน แต่แสดง resource ช่วยเหลือ
  - ⚠️ Crisis detection ทำ client-side (keyword matching) — ไม่ส่งข้อมูลไป server
- [x] Implement AI `safety` field handling (SDD §5.2):
  - `"crisis"` → แสดง crisis resources + คำทำนาย (ถ้ามี)
  - `"sensitive"` → แสดง disclaimer + คำทำนายปกติ
- [x] Edge case: browser back/forward ระหว่าง ritual flow
- [x] Edge case: SessionStorage หมดอายุ / ถูกเคลียร์ระหว่างดูดวง
- [x] Edge case: network error ระหว่างเรียก API (แสดง error + retry option)

### Verification

- [x] ดูดวงเสร็จ → ประวัติปรากฏใน `/history` ทันที
- [x] ประวัติรายการที่ 101 ทำให้รายการเก่าสุดหายไป
- [x] ลบประวัติแล้วข้อมูลหายจริง
- [x] พิมพ์คำถามที่มี crisis keywords → เห็น Crisis Panel + เบอร์สายด่วน
- [x] AI คืน `safety: "crisis"` → UI แสดง crisis resources
- [x] Network error → แสดง error message + retry ไม่ crash

### Done when

ระบบประวัติทำงานครบ crisis safety ตรวจจับได้ edge cases สำคัญถูกจัดการ ไม่มีจุดที่ app crash โดยไม่แสดง error ✅ (Phase 6 Complete)

---

## Phase 7 — Polish, Performance & Build

**Goal:** ขัดเกลา UX, optimized performance, เตรียม production build (SDD §10 Phase 5)

### Tasks

- [x] จัดหา/เพิ่มรูปไพ่ 78 ใบ (Rider-Waite-Smith, WebP/AVIF, 30-40 KB/รูป — SDD §7.1) ← ขึ้นกับ Q-005
- [x] รูป card back สำหรับไพ่คว่ำ (`/cards/Cover.webp`)
- [x] Image optimization: next/image, lazy loading, responsive sizes
- [x] Font loading optimization (Cinzel, Plus Jakarta Sans — SDD §6.1)
- [x] Mobile UX review: ทดสอบบน viewport 360px จริง, thumb zone ของปุ่ม (SDD §6.1)
- [x] Desktop layout: centered max-width 1100px (SDD §6.1)
- [x] Accessibility basics: keyboard navigation, screen reader labels, focus management (Radix UI ช่วยส่วนหนึ่ง)
- [x] Loading states ทุกจุดที่มี async operation
- [x] SEO metadata: title, description, OG tags (Arcanfractal branding)
- [x] ตั้งค่า environment variables สำหรับ production (AI API keys)
- [x] Production build สำเร็จ (`next build`)
- [ ] Deploy ขึ้น Vercel / Cloudflare Pages (SDD §7.1)

### Verification

- [x] รูปไพ่โหลดถูกต้อง ไม่ broken (78 cards + Cover webp local assets)
- [x] Animation ลื่น 60fps บน mid-range mobile device
- [x] ไม่มี layout shift (CLS ≤ 0.1)
- [x] Build สำเร็จไม่มี error (`next build` 100% pass)
- [ ] Deploy สำเร็จ เข้าถึงผ่าน URL ได้

### Done when

App build สำเร็จ รูปภาพ WebP ครบ 78 ใบ performance ดีบนมือถือ และเตรียมพร้อม deploy ขึ้น production ✅

---

## Phase 8 — Final Verification (SDD Compliance Check)

**Goal:** ตรวจสอบว่า implementation ครบตาม SDD ทุก requirement ก่อนถือว่าเสร็จ

### Tasks

- [x] ทวนทุก MVP feature ใน SDD §3 ว่า implement ครบ:
  - [x] Question Guidance
  - [x] 78-Card Deck Catalog
  - [x] Shuffle Once Engine
  - [x] No Duplicate Rule
  - [x] Progressive Card Reveal
  - [x] 4 Core Spreads (single, three-timeline, three-guidance, five-path)
  - [x] Reversed Cards (toggle + 50% random)
  - [x] Grounded AI Interpretation (JSON Schema + Hallucination Guard)
  - [x] Deterministic Fallback
  - [x] Local Reading History (100 records)
  - [x] Card Detail Sheet
  - [x] Copy as Text
  - [x] Crisis Safety Support
  - [x] Rate Limiting
- [x] ทวน Core User Flow (SDD §2): Question → Spread → Shuffle → Select & Reveal → Interpret → Result ครบ 6 ขั้นตอน
- [x] ทวน Key Design Decisions (SDD §12):
  - [x] D1: 1 Reading = 1 Deck (Shuffle Once) ✓
  - [x] D2: True Index Selection & Progressive Reveal ✓
  - [x] D3: Question ไม่มีผลต่อ Randomization ✓
  - [x] D4: No Duplicate เฉพาะภายใน Reading ✓
  - [x] D5: ไม่มี Login/Server DB ใน MVP ✓
  - [x] D6: Deterministic Fallback ทำงานเสมอ ✓
  - [x] D7: AI เป็นเพียง Interpreter ไม่เลือกไพ่เอง ✓
- [x] ทวน AI Pipeline flow ครบ (SDD §5): Input → Guard → AI Call → Validation → Self-Repair → Fallback
- [x] ทวน Reading Lifecycle State Machine ทำงานถูกต้อง (SDD §7)
- [x] ทดสอบ: จำลอง AI ล่ม → fallback ทำงานสำเร็จ
- [x] ทดสอบ: Mobile 360px user flow ทำงานครบจบ
- [x] ทดสอบ: Error cases สำคัญ (network error, invalid input, rate limit)
- [x] ไม่มี `[Future]` feature ถูก implement (SDD §3: User Accounts, Social Share, AI Chat, Celtic Cross)
- [x] Open Questions (Q-001 ถึง Q-005) ได้รับการ resolve หรือมี assumption ที่ยอมรับได้
- [x] Build สำเร็จ (`next build` 100% pass)
- [x] Final review เทียบกับ SDD ทุก section

### Done when

ทุก checkbox ใน Phase นี้ผ่าน — โปรเจกต์ถือว่า MVP complete ตาม SDD

---

## Phase 9 — Daily Card Ritual (Post-MVP Feature)

**Goal:** เพิ่มฟีเจอร์การจั่วไพ่รายวัน (One-Card Reading of the Day) เพื่อสร้าง Daily Routine Reflection และส่งเสริม Daily Engagement (`note.md` §1)

### Tasks

- [x] กำหนด Data Model สำหรับ Daily Card:
  - สร้าง interface/type `DailyCardRecord`: `{ date: string, card: DrawnCard, affirmation: string, theme: string, advice: string, locale: "th" | "en", drawnAt: string }`
  - สร้าง interface/type `DailyStreakState`: `{ currentStreak: number, maxStreak: number, lastDrawnDate: string, history: DailyCardRecord[] }`
- [x] ออกแบบและ Implement Storage & Reset Logic (Client-Side Storage):
  - บันทึกไพ่รายวันที่จั่วแล้วลงใน LocalStorage (key: เช่น `daily_card_record`, `daily_streak`)
  - ตรวจสอบเงื่อนไขการ reset อัตโนมัติเมื่อพ้นเที่ยงคืน (Local midnight reset)
  - ป้องกันการจั่วซ้ำในวันเดิม (Revisit view mode เมื่อเคยวาดแล้วในวันนั้น)
- [x] พัฒนา Micro-Interpretation Logic:
  - สร้างคำแปลแบบกระชับ (Affirmation, Theme of the Day, Mindset Advice)
  - รองรับ Fallback Micro-Interpretation จาก Deck Catalog โดยตรง
  - ออกแบบ Prompt สำหรับ Micro-Interpretation หากดึงจาก AI Engine หรือคำนวณแบบ Deterministic
  - รองรับปุ่มสลับภาษาคำแปลด่วน (Quick toggle Thai/English)
- [x] พัฒนา UI/UX สำหรับ Daily Card:
  - สร้าง Quick-access widget / Banner บนหน้าแรก (`/`)
  - สร้าง Dedicated View หรือ Modal สำหรับทำ Single-Draw Daily Ritual
  - ปรับปรุง Card Reveal Animation สำหรับการเปิดไพ่ใบเดียวให้กระชับเข้ากับ daily routine
- [x] พัฒนาระบบ Daily Streak & History Tracking:
  - คำนวณวันต่อเนื่อง (Consecutive days streak calculation) พร้อมจัดการกรณีขาดช่วง (Streak break)
  - สร้างหน้า/ส่วนแสดงผล Past Daily Cards ในมุมมอง Calendar-style หรือ Chronological list view
- [x] เขียน Unit & Integration Tests:
  - ตรวจสอบ Midnight reset logic และ timezone edge cases
  - ตรวจสอบ Streak calculation (วันต่อเนื่อง, ข้ามวัน, วันเดียวกันซ้ำ)
  - ตรวจสอบการป้องกันการจั่วซ้ำในวันเดียวกัน

### Verification

- [x] เข้าหน้า Daily Card สามารถจั่วไพ่ได้ 1 ใบ พร้อมแสดง Micro-Interpretation
- [x] สลับภาษาคำแปล Thai/English ได้ถูกต้อง
- [x] Refresh หรือกลับมาเปิดใหม่ในวันเดียวกัน จะแสดงไพ่เดิมที่เคยจั่ว ไม่สามารถจั่วซ้ำได้
- [x] ข้ามวัน (พ้นเที่ยงคืน) ระบบปลดล็อกให้จั่วไพ่ใบใหม่ของวันถัดไปได้
- [x] Streak นับเพิ่มขึ้นอย่างถูกต้องเมื่อจั่วติดต่อกัน
- [x] ดูประวัติการจั่วไพ่รายวันย้อนหลังได้

### Done when

ผู้ใช้สามารถเข้ามาร่วม Daily Ritual จั่วไพ่ 1 ใบประจำวัน ได้รับคำแนะนำกระชับ สลับภาษาได้ ไม่จั่วซ้ำในวันเดิม และติดตาม Streak รวมถึงประวัติย้อนหลังได้อย่างสมบูรณ์ ✅ (Phase 9 Complete)

---

## Phase 10 — Interactive Follow-up Inquiries (Post-MVP Feature)

**Goal:** เพิ่มความสามารถในการถามคำถามเจาะลึกต่อเนื่อง (Follow-up Questions) ภายใต้บริบทของ Reading เดิมโดยไม่ต้องสับไพ่ใหม่ (`note.md` §2, ขยายผลจาก `[Future] AI Follow-up Chat` ใน SDD §3)

### Tasks

- [ ] ออกแบบ API Contract และ Endpoint สำหรับ Follow-up:
  - ตัดสินใจสถาปัตยกรรม (ตาม Q-007): สร้าง endpoint เช่น `POST /api/interpret/follow-up`
  - กำหนด Payload Schema: `{ drawId, originalQuestion, spreadId, cards, analysis, initialSynthesis, followUpQuestion, threadHistory: Array<{ question: string, answer: string }>, locale }`
  - Output Schema: `{ answer: string, referencedCards: string[], safety: "none" | "sensitive" | "crisis" }`
  - กำหนด Rate Limiting / Turn Limit ต่อ 1 Reading Session (เช่น สูงสุด 3-5 คำถาม) เพื่อคุมต้นทุนและป้องกันการวนลูป
- [ ] พัฒนา Grounded Context-Preserving AI Prompting:
  - ผูก Original inquiry, Spread, Drawn cards, และ Previous synthesis เข้ากับ Prompt
  - กำหนด Strict Grounding Constraints: ห้ามสร้างไพ่ใหม่ (No Hallucination), ให้อ้างอิงเฉพาะไพ่ที่มีอยู่ใน Reading ปัจจุบัน
  - Enforce Safety & Crisis Guard เช่นเดียวกับคำถามแรก
  - เตรียม Deterministic Fallback ตอบคำถามเบื้องต้นกรณี AI มีปัญหา
- [ ] พัฒนา Multi-Turn Thread UI บนหน้า Reading Result (`/read?step=result`):
  - วาง Input Box ที่ด้านล่างของหน้า Result
  - ทำ Guidance / Example follow-up questions เพื่อแนะนำผู้ใช้
  - แสดงผลประวัติการสนทนา (Q&A thread) เรียงต่อกันอย่างชัดเจนใต้บทวิเคราะห์หลัก
  - แสดง Loading / Typing state ระหว่างรอ AI ตอบ
- [ ] ปรับปรุงการบันทึกประวัติ (Local Reading History):
  - ขยาย `ReadingRecord` type ให้รองรับ `followUpThread?: Array<{ id: string, question: string, answer: string, timestamp: string }>`
  - บันทึกบทสนทนา follow-up อัปเดตลง LocalStorage ร่วมกับ reading record เดิมทันทีที่มีการถาม-ตอบ
  - ตรวจสอบให้หน้า `/history` สามารถเปิดอ่านบทสนทนาถาม-ตอบย้อนหลังได้ครบถ้วน
- [ ] เขียน Unit & Integration Tests:
  - ทดสอบ Context preservation ใน AI prompt payload
  - ทดสอบ Zero-hallucination validation สำหรับ follow-up
  - ทดสอบ UI state การเพิ่ม turn คำถาม-คำตอบ และการ persist ลง local storage
  - ทดสอบ Session turn limit / rate limit enforcement

### Verification

- [ ] หน้า Result มีช่องกรอกคำถามเพิ่มเติมด้านล่าง
- [ ] ถามคำถามเพิ่มเติมแล้วได้คำตอบที่อ้างอิงไพ่ในสำรับที่เปิดไว้ ไม่กล่าวถึงไพ่นอกสำรับ
- [ ] Q&A แสดงผลเป็น Thread ใต้บทวิเคราะห์อย่างสวยงามและอ่านง่าย
- [ ] ข้อมูล Follow-up ถูกบันทึกลงใน Local Reading History เมื่อเปิดดูใน `/history` จะพบบทสนทนาครบถ้วน
- [ ] ระบบตรวจจับ Crisis keywords ในคำถาม follow-up ได้และแสดง Crisis support อย่างถูกต้อง
- [ ] ไม่สามารถยิงคำถามเกินโควตาต่อ Session ที่กำหนดได้

### Done when

ผู้ใช้สามารถพิมพ์ถามคำถามเจาะลึกต่อจากผลการทำนายเดิมได้ โดย AI ตอบตรงบริบทไพ่ที่มีอยู่ บันทึกเป็น thread ลงในประวัติ และมีระบบ safety ครบถ้วน

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
  ↓
═════════════════════════════════════════════════════
  Post-MVP Feature Roadmap (จาก note.md)
═════════════════════════════════════════════════════
  ↓
Phase 9 (Daily Card Ritual)
  ├── ต่อยอดจาก Tarot Engine (Phase 1)
  ├── ใช้องค์ประกอบ UI/Animations (Phase 4, Phase 5)
  └── จัดเก็บข้อมูลบน LocalStorage (แบบเดียวกับ Phase 6)
  ↓
Phase 10 (Interactive Follow-up Inquiries)
  ├── ต่อยอดจาก Server API & AI Integration (Phase 2, Phase 3)
  ├── ต่อยอดหน้า Reading Result (Phase 5)
  └── อัปเดต ReadingRecord & History Viewer (Phase 6)
```
