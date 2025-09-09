function createAuthMiddleware({ authService, userRepository }) {
    return async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. No token provided'
                });
            }

            const decoded = authService.verifyToken(token);
            const user = await userRepository.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            req.user = user.toJSON();
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    };
}

module.exports = createAuthMiddleware;