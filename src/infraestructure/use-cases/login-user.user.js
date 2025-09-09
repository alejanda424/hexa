class LoginUserUseCase {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    async execute(email, password) {
        try {
            console.log('LoginUserUseCase: Iniciando login para:', email);
            
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                console.log('LoginUserUseCase: Usuario no encontrado');
                throw new Error('Invalid credentials');
            }

            console.log('LoginUserUseCase: Usuario encontrado, verificando contraseña...');
            
            const isPasswordValid = await this.authService.comparePassword(password, user.password);
            if (!isPasswordValid) {
                console.log('LoginUserUseCase: Contraseña inválida');
                throw new Error('Invalid credentials');
            }

            console.log('LoginUserUseCase: Contraseña válida, generando token...');
            
            const token = this.authService.generateToken(user);
            
            console.log('LoginUserUseCase: Login exitoso');
            
            return {
                user: user.toJSON(), 
                token
            };
            
        } catch (error) {
            console.error('LoginUserUseCase Error:', error.message);
            throw error;
        }
    }
}

module.exports = LoginUserUseCase;