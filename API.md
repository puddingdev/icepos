# API.md — Google Apps Script

## Web App URL

```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
```

ใส่ URL นี้ใน `index.html` ที่ตัวแปร `GAS_URL`

---

## Endpoints

### POST — บันทึกข้อมูล

**Body (JSON):**
```json
{ "action": "log", "payload": { ... } }
```

**payload สำหรับขาย:**
```json
{
  "type": "sale",
  "date": "2025-06-01T10:30:00.000Z",
  "size": "L",
  "flavors": ["chocolate", "vanilla"],
  "toppings": ["oreo"],
  "price": 79,
  "cost": 38,
  "profit": 41
}
```

**payload สำหรับกินเอง:**
```json
{
  "type": "eat",
  "date": "2025-06-01T11:00:00.000Z",
  "ice": { "chocolate": 2 },
  "top": { "oreo": 1 }
}
```

**payload สำหรับซื้อสต็อก:**
```json
{
  "type": "purchase",
  "date": "2025-06-01T09:00:00.000Z",
  "category": "ice",
  "name": "ช็อกโกแลต",
  "qty": 80,
  "unit": "สกู๊ป",
  "price": 259,
  "costPerUnit": 3.24
}
```

**payload สำหรับบันทึก config (เมื่อเปลี่ยน size/รส/ท็อปปิ้ง):**
```json
{
  "type": "config",
  "key": "sizes",
  "value": "[{\"id\":\"M\",...}]"
}
```

**Response:**
```json
{ "success": true }
{ "success": false, "error": "message" }
```

---

### GET — ดึงข้อมูล

```
GET ?action=getAll
```

**Response:**
```json
{
  "orders": [ ...rows ],
  "purchases": [ ...rows ],
  "config": {
    "sizes": [...],
    "iceTypes": [...],
    "topTypes": [...]
  }
}
```

---

## Code.gs (วางใน Apps Script)

```javascript
const SPREADSHEET_ID = '1RgLmP1uY8KXiLnvOGSOjhD5288I3T5aPw4pTx1bI5s4/edit?gid=0#gid=0';
const SHEET_ORDERS   = 'orders';
const SHEET_PURCHASES = 'purchases';
const SHEET_CONFIG   = 'config';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload;

    if (action === 'log') {
      logEntry(payload);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'getAll') {
      return jsonResponse(getAllData());
    }
    return jsonResponse({ error: 'unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function logEntry(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const d  = new Date(payload.date || new Date());
  const ts = Utilities.formatDate(d, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  if (payload.type === 'sale') {
    const sh = ss.getSheetByName(SHEET_ORDERS);
    sh.appendRow([
      ts,
      'sale',
      payload.size,
      payload.flavors.join(', '),
      (payload.toppings || []).join(', '),
      payload.price,
      payload.cost,
      payload.profit
    ]);

  } else if (payload.type === 'eat') {
    const sh = ss.getSheetByName(SHEET_ORDERS);
    const iceParts = Object.entries(payload.ice || {})
      .map(([k, v]) => k + ' ' + v + 'สกู๊ป').join(', ');
    const topParts = Object.entries(payload.top || {})
      .map(([k, v]) => k + ' ' + v + 'เสิร์ฟ').join(', ');
    sh.appendRow([ts, 'eat', '', iceParts, topParts, '', '', '']);

  } else if (payload.type === 'purchase') {
    const sh = ss.getSheetByName(SHEET_PURCHASES);
    sh.appendRow([
      ts,
      payload.category,
      payload.name,
      payload.qty,
      payload.unit,
      payload.price,
      payload.costPerUnit
    ]);

  } else if (payload.type === 'config') {
    const sh = ss.getSheetByName(SHEET_CONFIG);
    const data = sh.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === payload.key) {
        sh.getRange(i + 1, 2).setValue(payload.value);
        sh.getRange(i + 1, 3).setValue(new Date());
        return;
      }
    }
    sh.appendRow([payload.key, payload.value, new Date()]);
  }
}

function getAllData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // orders
  const oSh = ss.getSheetByName(SHEET_ORDERS);
  const oRows = oSh.getDataRange().getValues().slice(1); // skip header
  const orders = oRows.map(r => ({
    date: r[0], type: r[1], size: r[2],
    flavors: r[3], toppings: r[4],
    price: r[5], cost: r[6], profit: r[7]
  }));

  // purchases
  const pSh = ss.getSheetByName(SHEET_PURCHASES);
  const pRows = pSh.getDataRange().getValues().slice(1);
  const purchases = pRows.map(r => ({
    date: r[0], category: r[1], name: r[2],
    qty: r[3], unit: r[4], price: r[5], costPerUnit: r[6]
  }));

  // config
  const cSh = ss.getSheetByName(SHEET_CONFIG);
  const cRows = cSh.getDataRange().getValues();
  const config = {};
  cRows.forEach(r => {
    try { config[r[0]] = JSON.parse(r[1]); }
    catch (e) { config[r[0]] = r[1]; }
  });

  return { orders, purchases, config };
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Setup: รันครั้งแรกเพื่อสร้าง headers ──
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let o = ss.getSheetByName(SHEET_ORDERS);
  if (!o) o = ss.insertSheet(SHEET_ORDERS);
  o.getRange(1,1,1,8).setValues([['timestamp','type','size','flavors','toppings','price','cost','profit']]);

  let p = ss.getSheetByName(SHEET_PURCHASES);
  if (!p) p = ss.insertSheet(SHEET_PURCHASES);
  p.getRange(1,1,1,7).setValues([['timestamp','category','name','qty','unit','price','costPerUnit']]);

  let c = ss.getSheetByName(SHEET_CONFIG);
  if (!c) c = ss.insertSheet(SHEET_CONFIG);
  c.getRange(1,1,1,3).setValues([['key','value','lastUpdated']]);

  SpreadsheetApp.flush();
  Logger.log('Setup complete!');
}
```

---

## วิธีเพิ่ม GAS_URL ใน index.html

เปิด `index.html` หาบรรทัด:
```javascript
// ============================================================
// STATE
// ============================================================
```

เพิ่มด้านบนสุดของ `<script>`:
```javascript
const GAS_URL = 'https://script.google.com/macros/s/[YOUR_ID]/exec';
```

แล้วเพิ่มฟังก์ชัน `syncToSheets(payload)`:
```javascript
async function syncToSheets(payload) {
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'log', payload }),
    });
  } catch (e) {
    console.warn('Sync failed (offline?):', e);
  }
}
```

เรียกใช้ทุกที่ที่มีการบันทึก เช่น ตอน confirm order:
```javascript
syncToSheets({ type:'sale', date: new Date().toISOString(), ...orderData });
```
