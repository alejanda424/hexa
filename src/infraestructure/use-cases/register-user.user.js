const User = require('../../domain/models/user.model');

class RegisterUserUseCase {
    constructor({ userRepository, authService }) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    async execute(userData) {
        try {
            console.log('RegisterUserUseCase: Iniciando registro con:', userData);
            
            if (!userData.email || !userData.password) {
                throw new Error('Email and password are required');
            }

            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            console.log('RegisterUserUseCase: Usuario no existe, procediendo...');

            const hashedPassword = await this.authService.hashPassword(userData.password);
            console.log('RegisterUserUseCase: Contraseña hasheada exitosamente');

            const userToCreate = {
                email: userData.email,
                password: hashedPassword
            };

            console.log('RegisterUserUseCase: Creando usuario en BD...');

            const createdUser = await this.userRepository.create(userToCreate);
            
            console.log('RegisterUserUseCase: Usuario creado exitosamente:', createdUser.toJSON());
            
            return createdUser;

        } catch (error) {
            console.error('RegisterUserUseCase Error:', error);
            throw error;
        }
    }
}

module.exports = RegisterUserUseCase;