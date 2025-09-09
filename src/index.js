require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Infrastructure
const Database = require('./infraestructure/config/database');
const createAuthMiddleware = require('./infraestructure/config/middleware/auth.middleware');

// Domain Services
const AuthService = require('./domain/services/auth.service');

// Application Use Cases
const RegisterUserUseCase = require('./infraestructure/use-cases/register-user.user');
const LoginUserUseCase = require('./infraestructure/use-cases/login-user.user');

// Adapters
const UserRepository = require('./infraestructure/repositories/user.repository');
const AuthController = require('./infraestructure/controllers/auth.controller');
const createAuthRoutes = require('./infraestructure/routes/auth.routes');

class Application {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.database = new Database();
    }

    async initialize() {
        // Initialize Services
        const authService = new AuthService(process.env.JWT_SECRET);

        // Initialize Repositories
        const userRepository = new UserRepository(this.database);

        // Initialize Use Cases
        const registerUserUseCase = new RegisterUserUseCase({ 
            userRepository, 
            authService 
        });
        
        const loginUserUseCase = new LoginUserUseCase(
            userRepository, 
            authService
        );

        // Initialize Controllers
        const authController = new AuthController(
            registerUserUseCase,
            loginUserUseCase
        );

        // Initialize Middleware
        const authMiddleware = createAuthMiddleware({ 
            authService, 
            userRepository 
        });

        this.app.use(helmet({
            contentSecurityPolicy: false,
        }));
        this.app.use(cors());
        this.app.use(express.json());

        this.app.use(express.static(path.join(__dirname, 'public')));

        this.app.use('/api/auth', createAuthRoutes(authController, authMiddleware));

        this.app.get('/health', (req, res) => {
            res.json({ 
                success: true, 
                message: 'Server is running',
                timestamp: new Date().toISOString()
            });
        });

        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        this.app.get('/debug', (req, res) => {
            const fs = require('fs');
            const path = require('path');
            try {
                const publicDir = path.join(__dirname, 'public');
                const files = fs.readdirSync(publicDir);
                res.json({
                    success: true,
                    publicDirectory: publicDir,
                    files: files,
                    cwd: process.cwd()
                });
            } catch (error) {
                res.json({
                    success: false,
                    error: error.message,
                    cwd: process.cwd()
                });
            }
        });

        this.app.use((err, req, res, next) => {
            console.error('Error:', err);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        });
    }

    async start() {
        try {
            await this.initialize();
            this.app.listen(this.port, () => {
                console.log(`Server running on port ${this.port}`);
                console.log(`Frontend: http://localhost:${this.port}`);
            });
        } catch (error) {
            console.error('Failed to start application:', error);
            process.exit(1);
        }
    }

    async shutdown() {
        try {
            await this.database.close();
            console.log('Application shut down gracefully');
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }
}

process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    if (global.app) {
        await global.app.shutdown();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    if (global.app) {
        await global.app.shutdown();
    }
    process.exit(0);
});

const app = new Application();
global.app = app;
app.start();