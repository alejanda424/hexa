const mysql = require('mysql2/promise');

class Database {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'taller4_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        });

        this.testConnection();
    }
    
    async testConnection() {
        try {
            const connection = await this.pool.getConnection();            
            const [rows] = await connection.execute('SELECT 1 as test');            
            const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
            if (tables.length === 0) {
                console.log('Users table does not exist!');
            } else {
                console.log('Users table found');
            }
            
            connection.release();
        } catch (error) {
            console.error('Database connection failed:', error.message);
            throw error;
        }
    }
    
    async execute(query, params = []) {
        try {           
            const [rows, fields] = await this.pool.execute(query, params);           
            return [rows, fields];
        } catch (error) {
            console.error('Query execution failed:', error.message);
            console.error('Query:', query);
            console.error('Params:', params);
            throw error;
        }
    }
    
    async close() {
        return this.pool.end();
    }
}


module.exports = Database;

