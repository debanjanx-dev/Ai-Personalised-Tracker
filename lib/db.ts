import { Pool } from 'pg';
import { neon, neonConfig } from '@neondatabase/serverless';

// Configure neon to use fetch API
neonConfig.fetchConnectionCache = true;

// For direct SQL queries (serverless)
const sql = neon(process.env.DATABASE_URL!);

// For pg Pool (when needed)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

// Export database methods
export const db = {
    query: async (text: string, params?: any[]) => {
        try {
            if (process.env.NODE_ENV === 'production') {
                // Use neon in production (serverless)
                const result = await sql(text, params);
                return { rows: result };
            } else {
                // Use pg Pool in development
                return await pool.query(text, params);
            }
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    },
    // Add other database methods as needed
};
