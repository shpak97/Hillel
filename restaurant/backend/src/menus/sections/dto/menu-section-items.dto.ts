import { IsArray, IsString } from 'class-validator';

export class ReplaceMenuSectionItemsDto {
  @IsArray()
  @IsString({ each: true })
  itemIds!: string[];
}
