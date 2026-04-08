export class CreateUserDto {
  email!: string;
  phone?: string;
  fullname?: string;
  meta?: Record<string, unknown>;
}
