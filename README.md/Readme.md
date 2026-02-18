# 🏭 OEE Web Monitoring System

ระบบติดตามและวิเคราะห์ OEE (Overall Equipment Effectiveness) แบบ Real-time

## ✨ Features

- ✅ Dashboard แสดงผล KPIs แบบ Real-time
- ✅ ฟอร์มบันทึกข้อมูลพร้อมคำนวณอัตโนมัติ
- ✅ กราฟวิเคราะห์แบบ Interactive
- ✅ Six Big Losses tracking
- ✅ เชื่อมต่อ Supabase Database
- ✅ Responsive design (ใช้งานบนมือถือได้)

## 🚀 การติดตั้ง

### 1. สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com)
2. สร้าง Project ใหม่
3. ไปที่ SQL Editor และรัน SQL จากไฟล์ schema
4. คัดลอก Project URL และ Anon Key

### 2. Config ไฟล์

แก้ไขไฟล์ `js/config.js`:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key-here';