# X Hotels — จบ Backend ให้สมบูรณ์ (Review → Supabase จริง → Deploy → CI)

Backend โค้ดเสร็จแล้ว (40 tests ผ่าน, typecheck สะอาด, dry-run ผ่าน) เหลือ 3 งาน: รีวิวโค้ดรอบสุดท้าย, เชื่อม Supabase จริง + deploy, และ CI

## สถานะแวดล้อม (ยืนยันแล้ว)
- Supabase: มีบัญชี ยังไม่มี project → ต้องมีขั้นตอนให้ผู้ใช้สร้างเอง
- Cloudflare: `wrangler login` แล้ว → deploy ได้ทันที
- Cloudinary: key จริงพร้อมใช้ (มีใน `backend/.env` ครบทั้ง 5 key) → smoke test ครบทุก endpoint รวม `/identity-verification`
- Git: 3 commits ยังไม่ push บน `main` (base สำหรับรีวิว = `89f2f07`), remote = `github.com/3est3est/x-hotels.git`
- `trustedOrigins` ใน auth.ts ดึงจาก `BETTER_AUTH_URL` ตัวเดียว — แก้ที่ var/secret เดียวจบ

## ข้อตัดสินใจสำคัญ
1. **Connection แบ่งตามหน้าที่**: migrate/seed ใช้ **session pooler (port 5432)** เพราะ `backend/src/db/migrate.ts` ไม่ได้ตั้ง `prepare: false` และ drizzle migrator ใช้ advisory lock ซึ่งไม่ปลอดภัยบน transaction pooler / runtime บน Workers ใช้ **transaction pooler (port 6543)** (client ตั้ง `prepare: false` แล้ว)
2. **ลำดับ**: review และแก้ findings ให้จบก่อน push เสมอ — Supabase wizard เป็นขั้นตอนคน ทำคู่ขนานได้
3. **Secrets**: ห้าม commit ทุกกรณี — `.env`/`.dev.vars` ถูก gitignore แล้ว, ฝั่ง production ใช้ `wrangler secret put`

## Tasks (เรียงตามลำดับ)

1. **รีวิวรอบสุดท้าย**
   - โหลด skill `code-review` รีวิวช่วง `89f2f07..HEAD` (commits: consolidate, polish, ลบ plan file)
   - แก้ findings ทั้งหมด → `bun test` + `bun run typecheck` ใน `backend/` ให้เขียว → commit fixes

2. **Supabase project (ขั้นตอนผู้ใช้ — ใช้ skill `wizard`)**
   - สร้าง project ใน dashboard (แนะนำ region **Singapore / ap-southeast-1**) ตั้งรหัสผ่าน DB
   - เก็บ connection string 2 แบบจากหน้า Connect: session pooler (`...pooler.supabase.com:5432`) และ transaction pooler (`...pooler.supabase.com:6543`)

3. **ตั้งค่า + migrate + seed**
   - `backend/.env`: `DATABASE_URL` = **session pooler 5432** (สำหรับ migrate/seed), เติม `BETTER_AUTH_SECRET` (สุ่มใหม่สำหรับ production แยกจาก dev), `CLOUDINARY_*` มีอยู่แล้ว
   - `bun run db:migrate` แล้ว `bun run db:seed` ใน `backend/`

4. **Smoke test ในเครื่อง (wrangler dev)**
   - สร้าง `backend/.dev.vars`: `DATABASE_URL` = **transaction pooler 6543** + secrets ครบ
   - `bun run dev` → curl ทดสอบ happy path เต็ม: `GET /health`, `GET /regions`, sign-up → `POST /identity-verification` (multipart) → `POST /bookings` → `POST /admin/bookings/:id/check-in` (ด้วยบัญชี management) → `POST /hotels/:id/reviews` → `GET /admin/stats`
   - ตรวจตัวเลข stats ให้ตรงกับข้อมูล seed

5. **Deploy ขึ้น Cloudflare Workers**
   - `wrangler secret put` ทั้ง 5 ตัว (DATABASE_URL ใช้ **6543**, BETTER_AUTH_SECRET, CLOUDINARY_* 3 ตัว)
   - `bun run deploy` → จด URL ที่ได้ (รูปแบบ `x-hotels-backend.<subdomain>.workers.dev`)
   - แก้ `wrangler.jsonc` vars `BETTER_AUTH_URL` เป็น URL จริง → deploy ซ้ำ (แก้ chicken-and-egg)
   - เพิ่ม `.dev.vars.example` หมายเหตุเรื่อง 5432/6543 ถ้ายังไม่มี

6. **Smoke test production** — ชุดเดียวกับขั้น 4 แต่ยิงที่ URL ที่ deploy (สมัครผู้ใช้/ข้อมูลใหม่ของ prod)

7. **CI (GitHub Actions)**
   - สร้าง `.github/workflows/backend.yml`: trigger `push` + `pull_request` บน `main` (paths `backend/**`), `oven-sh/setup-bun`, `bun install` ใน `backend/`, รัน `bun test` และ `bun run typecheck`
   - ไม่ต้องมี secrets (tests ใช้ PGlite)
   - Push ทุกอย่างขึ้น `origin main` → ตรวจว่า Actions เขียว

8. **เก็บกวาด** — commit ไฟล์ที่แก้ทั้งหมด, สรุป URL ที่ deploy + สถานะให้ผู้ใช้

## Out of scope
- Frontend ทั้งหมด (React + Vite + Tailwind + shadcn/ui ค่อยวางแผนรอบหน้า)
- Custom domain, staging environment, rate limiting

## Risks
- **drizzle migrate บน transaction pooler** → แก้แล้วโดยใช้ session pooler 5432 สำหรับ DDL (ข้อตัดสินใจข้อ 1)
- **Supabase project ใหม่ = empty state** → seed script รองรับอยู่แล้ว
- **BETTER_AUTH_URL ผิดตอน deploy แรก** → auth จะ reject cookie/origin → แก้ตามขั้น 5 แล้ว deploy ซ้ำ
- **IP allowlist ของ Supabase** → default เปิดกว้างอยู่แล้ว; ถ้าผู้ใช้เคยตั้ง IP restrict ต้องเพิ่ม IP ของ Cloudflare ไม่ได้ (ใช้ pooler ซึ่งเปิดสาธารณะ)

## Validation Plan
- `bun test` (40) + `bun run typecheck` เขียวหลังแก้ findings
- Happy path ผ่านครบทั้ง `wrangler dev` และ production URL
- `GET /admin/stats` คืนตัวเลขตรงกับ seed (รวม booking ที่ cancel ในเลข %)
- GitHub Actions เขียวบน commit ล่าสุด
