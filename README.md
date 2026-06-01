# 🍨 IcePOS

**A lightweight POS system for a small ice cream delivery shop**  
สร้างด้วย Vanilla HTML/JS · ข้อมูลเก็บใน Google Sheets · Deploy บน Vercel

🔗 **Live demo:** _coming soon_

---

## Features · ฟีเจอร์

| | |
|---|---|
| 🛒 **Sell** · ขาย | Select size → flavor → toppings → confirm. Auto-calculates price, cost, profit |
| 📦 **Stock** · สต็อก | Add ice cream flavors & toppings, track inventory with weighted-average cost |
| 📋 **History** · ประวัติ | Order log with eat-self entries, export to Excel (4 sheets) |
| 📊 **Summary** · สรุป | Revenue, margin, break-even tracker, daily/monthly projections |

---

## Stack

```
Browser (Vercel)  →  Google Apps Script (API)  →  Google Sheets (DB)
```

| Layer | Tech | Cost |
|---|---|---|
| Frontend | HTML + CSS + Vanilla JS | Free |
| Hosting | Vercel | Free |
| API | Google Apps Script Web App | Free |
| Database | Google Sheets | Free |

**Total infrastructure cost: ฿0 / month**

---

## Screenshots

_เพิ่มรูปได้ที่นี่_

---

## ไฟล์สำคัญ

```
icepos/
├── index.html      # แอปทั้งหมดอยู่ในไฟล์เดียว
├── API.md          # Google Apps Script code + endpoint docs
├── ARCHITECTURE.md # System design
└── CHANGELOG.md    # Version history
```

---

## Local Development

เปิด `index.html` ในเบราว์เซอร์ได้เลย — ไม่ต้อง build step  
ข้อมูลเก็บใน `localStorage` แม้ไม่มี internet

---

*Built for a real shop · ทำขึ้นเพื่อใช้งานจริง*
