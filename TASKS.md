# TASKS.md — Checklist ทำทีละขั้น

## Phase 1 — Setup Google Sheets + GAS
> เป้าหมาย: มี API ที่รับข้อมูลได้

- [ ] สร้าง Google Spreadsheet ชื่อ `IcePOS Database`
- [ ] Copy Spreadsheet ID จาก URL
- [ ] เปิด Apps Script (Extensions → Apps Script)
- [ ] วาง `Code.gs` จาก `API.md`
- [ ] แก้ `SPREADSHEET_ID` ในโค้ด
- [ ] รัน `setupSheets()` ครั้งเดียวเพื่อสร้าง headers
- [ ] Deploy เป็น Web App (Execute as: Me / Anyone can access)
- [ ] Copy Web App URL
- [ ] ทดสอบด้วย Postman หรือ curl:
  ```bash
  curl -L "https://script.google.com/macros/s/[ID]/exec?action=getAll"
  ```

---

## Phase 2 — เชื่อม POS กับ GAS
> เป้าหมาย: กดขายแล้วข้อมูลขึ้น Sheets

- [ ] เปิด `index.html`
- [ ] เพิ่ม `const GAS_URL = '...'` บนสุดของ `<script>`
- [ ] เพิ่มฟังก์ชัน `syncToSheets(payload)` (ดู `API.md`)
- [ ] เพิ่ม `syncToSheets(...)` ใน 3 จุด:
  - [ ] `el('btn-confirm').onclick` — เมื่อยืนยันออเดอร์
  - [ ] `el('btn-confirm-eat').onclick` — เมื่อบันทึกกินเอง
  - [ ] `el('btn-add-ice').onclick` + `el('btn-add-top').onclick` — เมื่อซื้อสต็อก
- [ ] ทดสอบ: กดขาย → เช็ค Sheets ว่ามีแถวใหม่

---

## Phase 3 — Deploy บน Vercel
> เป้าหมาย: มี URL ใช้ได้จากมือถือ

- [ ] สมัคร GitHub account (ถ้ายังไม่มี)
- [ ] สร้าง repo ชื่อ `icepos` (Public)
- [ ] Upload `index.html` → rename เป็น `index.html`
- [ ] สมัคร Vercel (login ด้วย GitHub)
- [ ] Add New Project → Import repo `icepos`
- [ ] กด Deploy → รอ ~1 นาที
- [ ] เปิด URL ที่ได้บนมือถือ → ทดสอบทุกหน้า
- [ ] กด Share → Add to Home Screen → ได้ไอคอนบนจอ

---

## Phase 4 — ทดสอบจริง
> เป้าหมาย: มั่นใจก่อนใช้งานจริง

- [ ] บันทึกซื้อสต็อก: ไอติม 4 กก. 259 บาท → เช็ค sheet `purchases`
- [ ] ขาย M ช็อกโกแลต → เช็ค sheet `orders`
- [ ] ขาย L 2 รส + ท็อปปิ้ง → เช็ค sheet `orders`
- [ ] กินเอง 2 สกู๊ป → เช็ค sheet `orders` (type=eat)
- [ ] เปิด Sheets ดูหน้า `orders` ว่าข้อมูลถูกต้อง
- [ ] ปิด WiFi → ขาย → เปิด WiFi → เช็คว่าไม่ crash (อาจไม่ sync แต่ไม่ควรพัง)

---

## Phase 5 — Nice to have (ทำเมื่อมีเวลา)
> ไม่จำเป็นตอนนี้

- [ ] Offline queue: เก็บ pending orders ไว้ใน localStorage แล้ว sync ทีหลัง
- [ ] หน้า Dashboard ใน Google Sheets: สร้าง Chart รายรับรายจ่ายอัตโนมัติ
- [ ] แจ้งเตือนสต็อกต่ำผ่าน LINE Notify
- [ ] ระบบสะสมแต้มลูกค้า

---

## Current Status

| Phase | สถานะ |
|---|---|
| Phase 1 — GAS Setup | ⬜ ยังไม่เริ่ม |
| Phase 2 — เชื่อม POS | ⬜ ยังไม่เริ่ม |
| Phase 3 — Vercel | ⬜ ยังไม่เริ่ม |
| Phase 4 — ทดสอบ | ⬜ ยังไม่เริ่ม |
