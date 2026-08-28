import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class MenuSectionResponseDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  menuId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  sortOrder!: number;

  @IsBoolean()
  isActive!: boolean;
}
