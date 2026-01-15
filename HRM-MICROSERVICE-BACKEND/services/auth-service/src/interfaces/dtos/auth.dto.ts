export class LoginRequest {
  email!: string;
  password!: string;
}

export class RegisterRequest {
  email!: string;
  username!: string;
  password!: string;
  fullName!: string;
  role!: string;
}

export class LoginResponse {
  message!: string;
  user!: {
    id: string;
    email: string;
    username: string;
    fullName: string;
  };
  token!: string;
}
