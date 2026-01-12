import { injectable, inject } from 'inversify';

@injectable()
export class LoginUserHandler {
  constructor(
    @inject('AuthRepository') private authRepository: any,
    @inject('PasswordService') private passwordService: any
  ) {}

  async handle(username: string, password: string): Promise<string> {
    const user = await this.authRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await this.passwordService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const token = 'generated-jwt-token';
    return token;
  }

}