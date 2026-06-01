# ARCHITECTURE.md

## ภาพรวมระบบ

```
┌─────────────────────────────────────────────────────────┐
│                    USER (มือถือ/คอม)                     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│              VERCEL (Static Hosting)                     │
│                   index.html                             │
│         Vanilla JS · CSS Variables · No Framework        │
└────────────────────────┬────────────────────────────────┘
                         │ fetch() POST/GET
                         │ CORS: allowed
┌────────────────────────▼────────────────────────────────┐
│           GOOGLE APPS SCRIPT (Web App)                   │
│                    Code.gs                               │
│   doPost() รับข้อมูล    doGet() ส่งข้อมูลกลับ           │
│   - validate input                                       │
│   - append to sheet                                      │
│   - return JSON response                                 │
└────────────────────────┬────────────────────────────────┘
                         │ SpreadsheetApp API
┌────────────────────────▼────────────────────────────────┐
│              GOOGLE SHEETS (Database)                    │
│                                                          │
│  ┌─────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │ orders  │  │ purchases │  │       config         │  │
│  │ (rows)  │  │  (rows)   │  │  sizes/iceTypes/tops  │  │
│  └─────────┘  └───────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### ยืนยันการขาย (Confirm Order)
```
กด "ยืนยัน"
  → JS สร้าง payload {type:'sale', size, flavors, price, ...}
  → fetch POST → GAS doPost()
  → GAS append row ลง sheet "orders"
  → GAS return {success:true}
  → JS แสดง toast ✓
  → localStorage update (cache local)
```

### กินเอง
```
กด "บันทึก" ในหน้ากินเอง
  → payload {type:'eat', ice:{...}, top:{...}}
  → fetch POST → GAS append → sheet "orders" (type=eat)
```

### ซื้อสต็อก
```
กด "บันทึก" ในหน้าสต็อก
  → payload {type:'ice'|'top', name, qty, price}
  → fetch POST → GAS append → sheet "purchases"
```

### โหลดข้อมูลครั้งแรก (หรือ refresh)
```
เปิดแอป
  → fetch GET ?action=getAll → GAS doGet()
  → GAS อ่าน orders + purchases + config จาก Sheets
  → return JSON
  → JS โหลดเข้า S (state) + localStorage
```

---

## Google Sheets Schema

### sheet: `orders`
| timestamp | type | size | flavors | toppings | price | cost | profit |
|---|---|---|---|---|---|---|---|
| 2025-06-01 10:30 | sale | L | ช็อกโกแลต,วานิลลา | โอรีโอ้ | 79 | 38 | 41 |
| 2025-06-01 11:00 | eat | — | ช็อกโกแลต 2สกู๊ป | — | — | — | — |

### sheet: `purchases`
| timestamp | type | name | qty | unit | price | costPerUnit |
|---|---|---|---|---|---|---|
| 2025-06-01 09:00 | ice | ช็อกโกแลต | 80 | สกู๊ป | 259 | 3.24 |
| 2025-06-01 09:05 | top | โอรีโอ้ | 15 | เสิร์ฟ | 45 | 3.00 |

### sheet: `config`
| key | value |
|---|---|
| sizes | `[{"id":"M","label":"M","scoops":5,...}]` |
| iceTypes | `[{"id":"chocolate","name":"ช็อกโกแลต",...}]` |
| topTypes | `[{"id":"oreo","name":"โอรีโอ้",...}]` |
| lastUpdated | 2025-06-01T09:00:00 |

---

## State Management

```
┌──────────────────────────────────────────┐
│              Browser State               │
│                                          │
│  S (in-memory)  ←→  localStorage (cache) │
│       ↕                                  │
│  Google Sheets (source of truth)         │
└──────────────────────────────────────────┘
```

- **S** = state object ใน JS memory (เร็ว ใช้ render UI)
- **localStorage** = cache เผื่อ offline / โหลดซ้ำเร็ว
- **Google Sheets** = source of truth ทุกอย่างถูกต้องที่นี่

### Sync Strategy (เรียบง่าย)
- **Write-through**: ทุก action → บันทึก Sheets ทันที
- **Read on load**: เปิดแอปครั้งแรก → ดึงข้อมูลจาก Sheets
- **Optimistic UI**: อัป UI ก่อน แล้วค่อย sync → รู้สึกเร็ว

---

## Offline Behavior

เมื่อไม่มีอินเทอร์เน็ต:
- แอปยังใช้ได้จาก localStorage cache
- ออเดอร์ที่ยืนยันจะเข้า **pending queue**
- เมื่อมีสัญญาณกลับ → auto sync queue ไป Sheets

*(ฟีเจอร์นี้ใน ROADMAP — v2)*

---

## ข้อจำกัดที่ต้องรู้

| ข้อจำกัด | รายละเอียด |
|---|---|
| GAS quota | 6 นาที/การรัน, 20,000 req/วัน (เกินพอสำหรับร้านเล็ก) |
| GAS latency | ~500ms–2s ต่อ request (ยอมรับได้) |
| Sheets limit | 10M cells/spreadsheet (ไม่มีทางเต็ม) |
| CORS | GAS จัดการให้อัตโนมัติเมื่อ deploy เป็น Web App |
