const db = require('./src/config/db');

async function updateTable() {
  try {
    console.log('Updating table sewa...\n');
    
    // List of columns to add
    const alterCommands = [
      "ALTER TABLE sewa ADD COLUMN nama_customer VARCHAR(100) AFTER user_id",
      "ALTER TABLE sewa ADD COLUMN email VARCHAR(100) AFTER nama_customer",
      "ALTER TABLE sewa ADD COLUMN no_hp VARCHAR(20) AFTER email",
      "ALTER TABLE sewa ADD COLUMN nama_ktp VARCHAR(100) AFTER no_hp",
      "ALTER TABLE sewa ADD COLUMN nik VARCHAR(16) AFTER nama_ktp",
      "ALTER TABLE sewa ADD COLUMN foto_ktp VARCHAR(255) AFTER nik",
      "ALTER TABLE sewa ADD COLUMN dengan_driver VARCHAR(10) DEFAULT 'tidak' AFTER tanggal_selesai",
      "ALTER TABLE sewa ADD COLUMN dp_dibayar DECIMAL(10,2) DEFAULT 0 AFTER total_harga",
      "ALTER TABLE sewa ADD COLUMN sisa_pembayaran DECIMAL(10,2) DEFAULT 0 AFTER dp_dibayar",
      "ALTER TABLE sewa ADD COLUMN metode_pembayaran VARCHAR(50) AFTER sisa_pembayaran",
      "ALTER TABLE sewa ADD COLUMN bank_tujuan VARCHAR(50) AFTER metode_pembayaran",
      "ALTER TABLE sewa MODIFY COLUMN user_id INT NULL"
    ];
    
    // Execute each command
    for (const command of alterCommands) {
      try {
        await db.query(command);
        console.log('✓', command.split('ADD COLUMN')[1]?.split(' AFTER')[0] || 'Modified user_id');
      } catch (error) {
        // Ignore duplicate column errors
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('→', command.split('ADD COLUMN')[1]?.split(' AFTER')[0] || 'user_id', '(already exists)');
        } else {
          console.error('✗ Error:', error.message);
        }
      }
    }
    
    console.log('\n✅ Table sewa berhasil diupdate!\n');
    
    // Show table structure
    const [columns] = await db.query('DESCRIBE sewa');
    console.log('Struktur table sewa:');
    console.table(columns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Default: col.Default
    })));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateTable();
