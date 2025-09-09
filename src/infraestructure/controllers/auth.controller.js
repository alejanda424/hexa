class AuthController {
    constructor(registerUserUseCase, loginUserUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
    }

    async register(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const user = await this.registerUserUseCase.execute({
                email,
                password
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: user.toJSON()
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await this.loginUserUseCase.execute(email, password);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    token: result.token
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = AuthController;