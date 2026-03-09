const db = require('./src/config/db');

async function fixBookingStatus() {
  try {
    console.log('🔧 Memperbaiki status booking...');

    // 1. Update NULL values to 'pending'
    const [updateResult] = await db.query(
      'UPDATE sewa SET status = ? WHERE status IS NULL',
      ['pending']
    );
    
    console.log(`✅ ${updateResult.affectedRows} booking diupdate ke status 'pending'`);

    // 2. Verify results
    const [bookings] = await db.query(
      'SELECT id, nama_customer, mobil_id, status, created_at FROM sewa ORDER BY created_at DESC LIMIT 10'
    );
    
    console.log('\n📋 10 Booking Terbaru:');
    console.table(bookings);

    // 3. Count by status
    const [statusCount] = await db.query(
      `SELECT status, COUNT(*) as jumlah 
       FROM sewa 
       GROUP BY status 
       ORDER BY jumlah DESC`
    );
    
    console.log('\n📊 Status Distribution:');
    console.table(statusCount);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBookingStatus();
