# Kelola Keuangan - Financial Dashboard

## 📊 Fitur

Dashboard keuangan admin dengan laporan lengkap untuk monitoring performa rental mobil.

### 1. Rekapan Bulanan
- **Total Booking**: Jumlah booking dalam periode tertentu
- **Total Pendapatan**: Total revenue dari semua booking
- **Sudah Dibayar**: Revenue yang sudah settlement
- **Belum Dibayar**: Revenue yang masih pending

### 2. Mobil Terlaris (Ranking)
Menampilkan ranking mobil berdasarkan:
- Jumlah kali disewa
- Total revenue yang dihasilkan
- Rata-rata durasi sewa
- Ranking dengan badge (🥇 🥈 🥉)

### 3. Perbandingan Bulanan (Per Tahun)
- Grafik bar chart pendapatan per bulan
- Jumlah booking per bulan
- Visual progress bar untuk perbandingan

---

## 🔧 API Endpoints

### 1. Monthly Financial Report
```
GET /api/analytics/monthly-report?year=2026&month=3
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "year": 2026,
      "month": 3,
      "month_name": "Maret"
    },
    "summary": {
      "total_bookings": 15,
      "total_revenue": "7500000",
      "paid_revenue": "6000000",
      "pending_revenue": "1500000"
    },
    "top_cars": [
      {
        "id": 1,
        "nama_mobil": "Toyota Avanza",
        "plat_nomor": "B 1234 XYZ",
        "total_bookings": 8,
        "total_revenue": "3200000",
        "avg_duration": "3.5"
      }
    ],
    "daily_trend": [...],
    "status_breakdown": [...]
  }
}
```

### 2. Yearly Comparison
```
GET /api/analytics/yearly-comparison?year=2026
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "monthly_comparison": [
      {
        "month": 1,
        "month_name": "Januari",
        "total_bookings": 10,
        "total_revenue": 5000000,
        "paid_revenue": 4500000
      },
      ...
    ]
  }
}
```

### 3. Car Performance
```
GET /api/analytics/car-performance?year=2026&month=3
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama_mobil": "Toyota Avanza",
      "total_bookings": 8,
      "total_revenue": "3200000",
      "avg_rental_days": "3.5",
      "total_rental_days": 28
    }
  ]
}
```

---

## 📱 Akses Dashboard

1. Login sebagai admin
2. Di dashboard admin, klik **"Kelola Keuangan"**
3. Atau akses langsung: `http://localhost:5173/admin/finance`

### Filter
- **Pilih Tahun**: Dropdown untuk memilih tahun
- **Pilih Bulan**: Dropdown untuk memilih bulan tertentu

---

## 🎨 UI/UX Features

### Summary Cards
- **Gradient backgrounds** untuk visual appeal
- **Real-time data** dari API
- **Currency formatting** (IDR)

### Top Cars Ranking
- **Badge system**: 🥇 🥈 🥉 untuk top 3
- **Hover effects** untuk interaktivitas
- **Detail info**: kali disewa, revenue, durasi rata-rata

### Monthly Comparison
- **Progress bar** dengan gradient purple-pink
- **Percentage calculation** relatif terhadap bulan tertinggi
- **Sortir otomatis** berdasarkan bulan

---

## 🔒 Security

- **Admin only**: Semua endpoints dilindungi dengan `auth` + `isAdmin` middleware
- **JWT Token**: Required di header Authorization
- **Error handling**: Proper error responses

---

## 📈 Use Cases

1. **Monthly Review**: Cek performa bulan ini vs bulan lalu
2. **Car Performance**: Identifikasi mobil yang laku keras vs yang jarang disewa
3. **Revenue Tracking**: Monitor pendapatan yang sudah vs belum dibayar
4. **Business Decision**: Data untuk strategi pricing & inventory

---

## 🚀 Future Enhancements

- [ ] Export ke PDF/Excel
- [ ] Chart visualizations (line chart, pie chart)
- [ ] Perbandingan year-over-year
- [ ] Profit margin calculation
- [ ] Customer retention metrics
- [ ] Payment method breakdown
