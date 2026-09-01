# X Hotels — Backend Wrap-up (คง stack เดิม + ปิดงานค้าง 2 รายการ + boot log)

> อัปเดต 2026-09-01: ข้อ 1 เสร็จแล้ว, เพิ่มข้อ 3 (boot log ตามคำขอ owner) — สิ่งที่ต้องทำจริงคือข้อ 2 กับข้อ 3

## การตัดสินใจ (settled)

- **คง stack เดิมทั้งหมด**: Bun + ElysiaJS + Drizzle + Supabase (Postgres) + Cloudinary + Better Auth + Cloudflare Workers — ไม่มีการ rewrite ไป Next.js/axum/Go เพราะ backend เสร็จ 100% (41 tests, CI เขียว, deploy production แล้ว) และ `requirements.md` §6 ระบุไม่ให้เพิ่มสิ่งนอกสเปก
- ข้อกังวลเรื่อง "Gin ช้ากว่า ElysiaJS" เป็น micro-benchmark ไม่มีผลต่อระบบที่ latency มาจาก DB round-trip ผ่าน Hyperdrive

## Tasks (เรียงตามลำดับ)

1. ✅ **แก้ `BETTER_AUTH_SECRET` ฝั่ง local — เสร็จแล้ว (2026-09-01)**
   - หมุนค่าใหม่ใน `backend/.env` + `backend/.dev.vars` (แยกจาก production) — gitignored ยืนยันแล้ว
   - เพิ่ม guard ใน `backend/src/dev.ts:18-23` (โยน error ตอน boot ถ้า placeholder/สั้นกว่า 32 ตัวอักษร) — ทดสอบแล้วว่า reject `change-me` ได้จริง
   - ตรวจแล้ว: 41 tests ผ่าน, typecheck สะอาด, `bun dev` ไม่มี warning อีก, review ผ่าน (แนะนำ gitignore `current-task.md` — ทำแล้ว)

2. ⏳ **ทดสอบ Identity Verification ด้วยบัตรจริง** — งานค้างเดียวที่เหลือ (smoke test เดิมใช้ dummy PNG)
   - ใช้ `wrangler dev` ต่อ Supabase + Cloudinary จริง: sign-up บัญชีทดสอบ → `POST /identity-verification` (multipart, รูปบัตรจริง) → ยืนยันว่าผ่าน flow signature → upload → verify และ status อัปเดตถูกต้อง
   - ทดซ้ำบน production URL ด้วยบัญชีทดสอบใหม่

3. **เพิ่ม boot log ใน `dev.ts`** — ตอนนี้บูตสำเร็จแล้วเงียบสนิท แยกไม่ออกระหว่าง "รันอยู่" กับ "ค้าง"
   - แก้ `backend/src/dev.ts:34`: ย้ายไปใช้ callback ของ `.listen(3000, () => console.log('hello elysia — backend listening on http://localhost:3000'))`
   - เฉพาะ dev entrypoint เท่านั้น — `index.ts` (Workers production) ไม่แตะ (workerd ไม่มีความหมายของ boot log)
   - ข้อความตามที่ owner เลือก: "hello elysia" + URL

## Risks / ระวัง

- **PII จริง**: รูปบัตรประชาชน/พาสปอร์ตขึ้น Cloudinary จริง — ใช้บัญชีทดสอบเท่านั้น และลบ asset บน Cloudinary หลังทดสอบเสร็จ (จด public id ไว้ก่อนลบ)
- แก้ secret ใน `.env` ไม่กระทบ session production (คนละ secret, คนละ environment)

## Out of scope

- การเปลี่ยน stack ทั้งหมด (Next.js + axum, Go + Gin) — ปิดเป็นการตัดสินใจแล้ว
- Frontend ทุกรูปแบบ (รอ owner สั่ง ตาม `current-task.md`)
- Feature เพิ่มนอกเหนือจาก `requirements.md` (rate limiting, custom domain ฯลฯ)

## Validation Plan

- `cd backend && bun run dev` → พิมพ์ `hello elysia — backend listening on http://localhost:3000` ทันทีที่พร้อม
- `bun test` + `bun run typecheck` เขียว (ถ้าเพิ่ม guard ใน dev.ts)
- `bash backend/scripts/smoke-session.sh` เขียว (regression harness)
- Flow identity-verification ผ่านทั้ง `wrangler dev` และ production ด้วยบัตรจริง; asset Cloudinary ถูกลบหลังทดสอบ
- อัปเดต `current-task.md`: ตัดรายการค้างทั้ง 2 ออกหลังเสร็จ

## หมายเหตุสำหรับ session ถัดไป

- งานนี้เหมาะกับ agent session เดียวจบ (implementation-capable agent) — ไม่ต้องใช้ wayfinder map
- เมื่อจบ phase นี้ ประตูถัดไปคือการ grill แผน frontend (React + Vite + Tailwind บน Cloudflare Pages)
