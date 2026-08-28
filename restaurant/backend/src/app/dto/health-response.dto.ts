import { IsIn, IsString } from 'class-validator';

export class HealthResponseDto {
  @IsString()
  @IsIn(['ok'])
  status!: string;
}
