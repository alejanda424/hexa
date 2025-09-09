const User = require('../../domain/models/user.model');

class UserRepository {
    constructor(database) {
        this.database = database;
    }

    async create(userData) {
        try {
            console.log('UserRepository.create: Iniciando con datos:', userData);
            
            const user = new User(userData);
            console.log('UserRepository.create: Usuario creado en memoria');
            
            user.validate();
            console.log('UserRepository.create: Validación exitosa');

            const query = `
                INSERT INTO users (email, password, created_at) 
                VALUES (?, ?, NOW())
            `;
            
            console.log('UserRepository.create: Ejecutando query INSERT...');
            console.log('Email:', user.email);
            console.log('Password hash length:', user.password.length);
            
            const [result] = await this.database.execute(query, [
                user.email,
                user.password
            ]);

            console.log('UserRepository.create: INSERT exitoso, result:', result);
            console.log('UserRepository.create: insertId:', result.insertId);
            console.log('UserRepository.create: affectedRows:', result.affectedRows);

            const verifyQuery = 'SELECT * FROM users WHERE id = ?';
            const [verifyResult] = await this.database.execute(verifyQuery, [result.insertId]);
            
            console.log('UserRepository.create: Verificación post-insert:', verifyResult);

            if (verifyResult.length === 0) {
                throw new Error('User was not saved to database');
            }

            const createdUser = new User({
                id: result.insertId,
                email: user.email,
                password: user.password,
                createdAt: verifyResult[0].created_at
            });

            console.log('UserRepository.create: Usuario final creado:', createdUser.toJSON());
            return createdUser;

        } catch (error) {
            console.error('UserRepository.create ERROR:', error);
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            console.log('UserRepository.findByEmail: Buscando email:', email);
            
            const query = 'SELECT * FROM users WHERE email = ?';
            const [rows] = await this.database.execute(query, [email]);
            
            console.log('UserRepository.findByEmail: Encontrados', rows.length, 'usuarios');
            
            if (rows.length === 0) {
                console.log('UserRepository.findByEmail: Usuario no encontrado');
                return null;
            }

            const userData = rows[0];
            console.log('UserRepository.findByEmail: Usuario encontrado:', {
                id: userData.id,
                email: userData.email,
                created_at: userData.created_at
            });

            return new User({
                id: userData.id,
                email: userData.email,
                password: userData.password,
                createdAt: userData.created_at
            });
        } catch (error) {
            console.error('UserRepository.findByEmail ERROR:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            console.log('UserRepository.findById: Buscando ID:', id);
            
            const query = 'SELECT * FROM users WHERE id = ?';
            const [rows] = await this.database.execute(query, [id]);
            
            console.log('UserRepository.findById: Encontrados', rows.length, 'usuarios');
            
            if (rows.length === 0) {
                console.log('UserRepository.findById: Usuario no encontrado');
                return null;
            }

            const userData = rows[0];
            return new User({
                id: userData.id,
                email: userData.email,
                password: userData.password,
                createdAt: userData.created_at
            });
        } catch (error) {
            console.error('UserRepository.findById ERROR:', error);
            throw error;
        }
    }
}

module.exports = UserRepository;