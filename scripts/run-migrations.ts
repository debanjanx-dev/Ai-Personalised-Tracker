import { query } from '../lib/db';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct order
    
    // Execute each migration
    for (const file of migrationFiles) {
      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await query(sql);
      console.log(`Migration ${file} completed successfully`);
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 