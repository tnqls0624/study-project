import { Exclude } from 'class-transformer';

@Exclude()
export class LoginResponseDto {
  @Exclude()
  readonly access_token: string;
}
