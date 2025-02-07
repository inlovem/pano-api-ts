import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const sslCert = process.env.PROD_SSL_CERT;


if (!sslCert) {
  console.error('SSL certificate not found');
  process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.LOCAL_DATABASE_URL,
    
    // host: process.env.DEV_DB_HOST,
    // port: parseInt(process.env.DEV_DB_PORT || '5432', 10),
    // user: process.env.DEV_DB_USER,
    // password: process.env.DEV_DB_PASSWORD,
    // database: process.env.DEV_DB_NAME,
    //  ssl: {
    //    rejectUnauthorized: true,
    //   // Use the decoded or directly assigned certificate here
    //    ca: sslCert.replace(/\\n/g, '\n'), // If not base64 encoded but uses \n for new lines
    //   // ca: decodedCert, // Use this line if you're decoding from base64
    //  }
});

console.log('Connecting to PostgreSQL database...', pool);

export async function connectToDb() {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database successfully');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  }
}
