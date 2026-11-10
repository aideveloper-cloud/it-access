# KGarden IT Asset (it-web)

ระบบจัดการอุปกรณ์ IT สำหรับ **ทีม IT Support ใช้ภายในเท่านั้น** (มี login, ไม่มีส่วนแจ้งเคสของพนักงาน)
เขียนใหม่ทั้งหมดด้วย **Next.js 16 + React 19 + Tailwind CSS 4 + Bun** — ฐานข้อมูล SQLite ผ่าน `node:sqlite` (ไม่ต้อง compile native module)

## เริ่มใช้งาน

```bash
bun install
bun run dev        # เปิด http://localhost:3000
```

- **Login:** ผู้ใช้ `admin` รหัสผ่าน `kgarden@it`
  เปลี่ยนได้ผ่าน environment variables: `ADMIN_USER`, `ADMIN_PASS`, `AUTH_SECRET`
- Production: `bun run build` แล้ว `bun run start`

## หน้าในระบบ

| เส้นทาง | หน้าที่ |
|---|---|
| `/login` | เข้าสู่ระบบ |
| `/admin/overview` | ภาพรวม: จำนวนแยกสถานะ/หมวด, ความเคลื่อนไหวล่าสุด, อุปกรณ์อายุเกิน 4 ปี |
| `/admin/assets` | ทะเบียนอุปกรณ์ ค้นหา/กรอง + เพิ่ม/แก้ไข/ลบ + **Export Excel** ตามตัวกรอง |
| `/admin/assets/[id]` | รายละเอียดอุปกรณ์ + บันทึกซ่อม/ตรวจเช็คพร้อม**ค่าใช้จ่าย** + ค่าซ่อมสะสมต่อเครื่อง |
| `/admin/licenses` | ทะเบียน License / โดเมน / SSL — เรียงตามวันหมดอายุ ใกล้หมด (≤60 วัน) ขึ้นเตือนหน้าภาพรวม |
| `/admin/history` | รวมประวัติทุกเครื่อง ค้นหาย้อนหลัง พร้อมค่าใช้จ่าย |

เปลี่ยนผู้ถือครองหรือสถานะเมื่อไหร่ ระบบบันทึกประวัติให้อัตโนมัติ

## สำรองข้อมูลอัตโนมัติ (2 ชั้น)

1. **ในเครื่อง** — ทุกวันแรกที่ server ทำงาน ระบบ copy ฐานข้อมูลไป `data/backups/itsupport-YYYY-MM-DD.db` เก็บ 14 ไฟล์ล่าสุด
2. **ขึ้น Wasabi cloud** — cron บน server รันทุกวัน 02:30 อัปโหลด `itsupport.db` ไป
   `wasabi:kg-it-access/backups/` เก็บย้อนหลัง 30 วัน (สคริปต์: `/opt/it-web/backup-to-wasabi.sh`,
   config rclone: `/root/.config/rclone/rclone.conf`, log: `/var/log/it-web-backup.log`)

ข้อมูลของระบบเก่า (audit.db) ถูกเก็บถาวรไว้ที่ `wasabi:kg-it-access/archive/old-it-asset-audit/`

## Production (it.access.kgarden.co.th)

| รายการ | ค่า |
|---|---|
| Server | DigitalOcean `k-garden-server` — `ssh root@152.42.177.130` (ใช้ SSH key เครื่อง IT) |
| ตำแหน่งแอป | `/opt/it-web` (standalone build + `data/itsupport.db`) |
| Process manager | pm2 ชื่อ `it-web` — fork mode, Node 24 ที่ `/opt/node24/bin/node` (Node 20 ของระบบไม่มี `node:sqlite`) |
| พอร์ต | 3005 → Caddy (docker `proxy`) reverse proxy จากโดเมน |
| ตั้งค่า/รหัสผ่าน | `/opt/it-web/ecosystem.config.js` (ADMIN_USER, ADMIN_PASS, AUTH_SECRET) |
| ระบบเก่า | `/opt/it-asset-audit` — ปิดแล้ว (pm2 ลบแล้ว) เก็บไฟล์ไว้เฉยๆ |

**วิธี deploy เวอร์ชันใหม่:** แก้โค้ดเสร็จแล้วรัน `bash deploy.sh` จบ
(build → อัปโหลด → restart โดยไม่แตะฐานข้อมูลบน server)

**คำสั่งดูแลบน server:**
```bash
pm2 ls                 # ดูสถานะ
pm2 logs it-web        # ดู log
pm2 restart it-web     # restart
```

## โครงสร้าง

```
lib/db.ts         โครงสร้างตาราง + ตัวช่วย (node:sqlite)
lib/auth.ts       ระบบ login ด้วย session cookie
lib/actions.ts    Server Actions ทั้งหมด (login, CRUD, บันทึกซ่อม)
lib/constants.ts  หมวดหมู่ / สถานะ / ประเภทบันทึก
app/admin/...     หน้าทั้งหมด (Server Components)
data/itsupport.db ฐานข้อมูล — สำรองไฟล์นี้ไฟล์เดียวพอ (ไม่เข้า git)
```

## ข้อมูล

ข้อมูลตั้งต้น 272 รายการ import มาจาก `Asset It ทั้งหมด.xlsx` แล้ว
(ผ่านสคริปต์ `../import_excel.py` ของระบบเดิม → copy `itsupport.db` มาไว้ที่ `data/`)
