import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  validateResponseDto,
  validateResponseDtoList,
} from 'src/common/utils/validate-response.util';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
} from './dto/ingredient.dto';
import { IngredientResponseDto } from './dto/ingredient-response.dto';
import { IngredientsService } from './ingredients.service';

@Controller('restaurants/:restaurantUuid/ingredients')
@UseGuards(AuthGuard)
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  async findAll(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
  ) {
    const result = await this.ingredientsService.findAll(
      userId,
      restaurantUuid,
    );
    return validateResponseDtoList(IngredientResponseDto, result);
  }

  @Get(':ingredientUuid')
  async findOne(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('ingredientUuid') ingredientUuid: string,
  ) {
    const result = await this.ingredientsService.findOne(
      userId,
      restaurantUuid,
      ingredientUuid,
    );
    return validateResponseDto(IngredientResponseDto, result);
  }

  @Post()
  async create(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Body() dto: CreateIngredientDto,
  ) {
    const result = await this.ingredientsService.create(
      userId,
      restaurantUuid,
      dto,
    );
    return validateResponseDto(IngredientResponseDto, result);
  }

  @Patch(':ingredientUuid')
  async update(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('ingredientUuid') ingredientUuid: string,
    @Body() dto: UpdateIngredientDto,
  ) {
    const result = await this.ingredientsService.update(
      userId,
      restaurantUuid,
      ingredientUuid,
      dto,
    );
    return validateResponseDto(IngredientResponseDto, result);
  }

  @Delete(':ingredientUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('ingredientUuid') ingredientUuid: string,
  ): Promise<void> {
    await this.ingredientsService.remove(
      userId,
      restaurantUuid,
      ingredientUuid,
    );
  }
}
