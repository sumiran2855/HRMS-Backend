export class PasswordHasher {
  hash(password: string): string {
    return "hashedPassword";
  }

  compare(password: string, hash: string): boolean {
    return true;
  }
}
