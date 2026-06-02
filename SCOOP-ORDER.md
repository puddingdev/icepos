# SCOOP-ORDER.md — Customer Website Reference

## โปรเจกต์คืออะไร
Customer Ordering Website สำหรับลูกค้าสั่งไอศกรีม Delivery
ลูกค้าสั่งบนเว็บ → ออเดอร์เข้า IcePOS อัตโนมัติ

## ที่อยู่
```
Local:  d:\Project\scoop-order\
GitHub: github.com/puddingdev/scoop-order
```

## Stack
Next.js 16 · TypeScript · Tailwind CSS v4 · Vercel

## Pages
| Path | ทำอะไร |
|---|---|
| `/` | Home — โลโก้ + ปุ่มสั่ง |
| `/order` | Order form — เลือก size/รส/ท็อปปิ้ง/โซน/ข้อมูลลูกค้า |
| `/order/[orderNo]` | Tracking — ดูสถานะออเดอร์ realtime |

## การเชื่อมต่อ
ใช้ GAS URL เดียวกับ IcePOS:
```
https://script.google.com/macros/s/AKfycbzNM4I-1rSyDFTRtigO08DXn64Ii6t1fZMGJiPE8yQoAZoHsJetlgYeHIU_XdmYqWRhgA/exec
```

scoop-order เรียกใช้:
- `POST createOrder` → สร้างออเดอร์ใหม่ → sheet `online_orders`
- `GET getOrderByNo` → ลูกค้า tracking สถานะ

IcePOS (ไฟล์นี้) รับออเดอร์:
- หน้า "ออเดอร์" อ่าน `GET getOrders` ดึงออเดอร์ทั้งหมดมาแสดง
- source = `WEBSITE` คือออเดอร์จาก scoop-order

## Order Flow
```
ลูกค้าสั่งบน scoop-order
  → POST createOrder → GAS → sheet online_orders
  → IcePOS แสดงในหน้า "ออเดอร์" (source: WEBSITE)
  → ร้านกด "รับออเดอร์" → gen QR PromptPay → ส่งใน Messenger
  → ลูกค้าโอนเงิน → ร้านกด "ยืนยันชำระ"
  → ร้านทำ → ส่ง → กด "จัดส่งสำเร็จ"
  → scoop-order /order/[orderNo] แสดง DELIVERED
```
