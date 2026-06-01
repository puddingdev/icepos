# CHANGELOG.md

รูปแบบ: `[version] — วันที่` ตาม [Keep a Changelog](https://keepachangelog.com)

---

## [Unreleased] — Google Sheets Integration
### Planned
- เชื่อม Google Apps Script เป็น backend API
- บันทึกออเดอร์ลง Google Sheets เรียลไทม์
- โหลด config (sizes/iceTypes/topTypes) จาก Sheets
- Deploy บน Vercel

---

## [0.4.0] — 2025-06 — Warm UI Rewrite
### Changed
- เขียน UI ใหม่ทั้งหมด — warm tone (ครีม/น้ำตาล) สไตล์ minimal
- เปลี่ยนฟอนต์เป็น Noto Sans Thai
- ใช้ CSS Variables ทั้งหมด
- Bottom sheet modal แทน popup
- ปุ่ม float "😋 กินเอง" บนหน้าขาย

### Fixed
- **แก้ปัญหา onclick พัง** — เปลี่ยนจาก innerHTML+onclick string → createElement + .onclick โดยตรง ไม่มี escaped quotes อีกต่อไป

---

## [0.3.0] — 2025-06 — Dynamic Types + Export
### Added
- เพิ่ม/ลบรสไอติมได้เอง
- เพิ่ม/ลบท็อปปิ้งได้เอง
- เพิ่ม/ลบขนาด (M/L/XL/...) ได้เอง
- Export Excel 4 sheets: รายการขาย / กินเอง / ซื้อสต็อก / สรุปรายวัน
- บันทึกกินเองแสดงในประวัติ (badge ชมพู)
- ย้ายปุ่มกินเองออกจากหน้าสต็อก

---

## [0.2.0] — 2025-06 — Stock Management
### Added
- หน้าสต็อก: บันทึกซื้อไอติม/ท็อปปิ้ง
- คำนวณต้นทุน/สกู๊ป และต้นทุน/เสิร์ฟอัตโนมัติ (weighted average)
- แถบสต็อกแสดงระดับสต็อก (เขียว/เหลือง/แดง)
- แจ้งเตือนสต็อกใกล้หมดบนหน้าขาย

### Changed
- ท็อปปิ้งนับเป็น "เสิร์ฟ" แทน "กระปุก"

---

## [0.1.0] — 2025-06 — MVP
### Added
- หน้าขาย: เลือกขนาด M/L → รส → ท็อปปิ้ง → ยืนยัน
- คำนวณราคา ต้นทุน กำไรต่อออเดอร์
- หักสต็อกสกู๊ปและเสิร์ฟอัตโนมัติ
- หน้าประวัติออเดอร์
- หน้าสรุป: กำไร/ขาดทุน / คืนทุน / สถิติรายวัน-เดือน
- บันทึกข้อมูลใน localStorage
