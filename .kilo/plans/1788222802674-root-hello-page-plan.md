# X Hotels — หน้าแรก `GET /` ให้เห็นในเบราว์เซอร์ (hello elysia)

> แก้ความเข้าใจจากแผนก่อนหน้า (`1788143544879-backend-wrap-up-plan.md` ข้อ 3): owner ต้องการเปิด `http://localhost:3000/` ในเบราว์เซอร์แล้วเห็นข้อความว่าเซิร์ฟเวอร์รันอยู่ — ไม่ใช่ log ใน terminal และไม่ต้องไป `/health` (ตอนนี้เปิด `/` แล้วเจอ 404 เพราะไม่มี route นี้)
> Terminal boot log ใน `dev.ts` ที่ทำไปแล้วคงไว้ (ใช้ร่วมกันได้)

## การตัดสินใจ (settled)

- เพิ่ม route `GET /` ใน `backend/src/app.ts` คืนค่า `'hello elysia'` (ข้อความเดียวกับที่ owner เลือกไว้) — owner เลือกใส่ที่ `app.ts` ไม่ใช่ `dev.ts` เท่านั้น
- ผลคือทั้ง localhost:3000 และ production URL แสดงหน้านี้เหมือนกัน, เขียน unit test ครอบได้, `index.ts` ไม่ต้องแตะ (consume `createApp` ตามเดิม)
- ไม่ใช่ feature นอกสเปก — เป็น route สายตามองสถานะประเภทเดียวกับ `/health` ที่มีอยู่แล้ว
- รูปแบบ: คืน string ธรรมดา (Elysia ตอบ `text/plain` — เบราว์เซอร์แสดงข้อความได้ทันที) ไม่ทำ HTML ปรุงแต่ง

## Tasks (เรียงตามลำดับ)

1. `backend/src/app.ts:37` — เพิ่ม `.get('/', () => 'hello elysia')` ข้าง ๆ `.get('/health', ...)`
   - ตรวจแล้วว่าไม่มี route `/` อยู่ก่อน และไม่ชนกับ Better Auth (`/api/auth/*`) หรือ module prefixes
2. เพิ่ม test — ไฟล์ใหม่ `backend/test/root.test.ts` (โครงสร้างตาม test อื่น ใช้ `createTestApp()` จาก `test/helpers.ts:29`):
   - `GET /` → 200, body เป็น `hello elysia`
3. อัปเดต `current-task.md` หมายเหตุ Local dev: เปิด `http://localhost:3000/` ในเบราว์เซอร์เห็น `hello elysia` = เซิร์ฟเวอร์รันอยู่ (production ด้วย)

## Risks / ระวัง

- แทบไม่มี — route ไม่แตะ DB/auth/Cloudinary, ไม่มีข้อมูล PII, ไม่กระทบ session หรือ deploy pipeline
- Deploy production จะได้ route ใหม่หลัง `bun run deploy` ครั้งถัดไป (ถ้า owner deploy เอง ไม่ต้องทำอะไรเพิ่ม)

## Validation Plan

- `cd backend && bun run typecheck` + `bun test` → เขียว (42 tests)
- `bun run dev` → เปิด `http://localhost:3000/` ในเบราว์เซอร์ → เห็น `hello elysia` (ไม่มี 404)
- `curl -s http://localhost:3000/` → `hello elysia` (200)
- `bash backend/scripts/smoke-session.sh` เขียว (regression harness ไม่พัง)
- ถ้าต้องการยืนยัน production: `curl -s https://x-hotels-backend.kanompang450.workers.dev/` หลัง deploy

## Out of scope

- HTML/หน้าเว็บสวย ๆ, frontend ทุกรูปแบบ (รอ owner สั่ง)
- การแก้ `dev.ts` เพิ่ม (boot log จบแล้ว) และ `index.ts`
