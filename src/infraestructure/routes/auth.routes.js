const express = require('express');

function createAuthRoutes(authController, authMiddleware) {
    const router = express.Router();

    router.post('/register', (req, res) => authController.register(req, res));
    router.post('/login', (req, res) => authController.login(req, res));

    router.get('/profile', authMiddleware, (req, res) => {
        res.json({
            success: true,
            message: 'Profile accessed successfully',
            data: req.user
        });
    });

    return router;
}

module.exports = createAuthRoutes;