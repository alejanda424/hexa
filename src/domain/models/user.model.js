class User {
    constructor({ id, email, password, createdAt }) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
    }

    validate() {
        if (!this.email || !this.password) {
            throw new Error("Email and password are required.");
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            throw new Error("Please provide a valid email address.");
        }
        
        if (this.password.length < 4) {
            throw new Error("Password must have at least 4 characters.");
        }
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            createdAt: this.createdAt,
        };
    }
}

module.exports = User;