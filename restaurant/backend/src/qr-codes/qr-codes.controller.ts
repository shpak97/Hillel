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
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  validateResponseDto,
  validateResponseDtoList,
} from 'src/common/utils/validate-response.util';
import { QrFormatQueryDto } from 'src/qr/dto/qr-query.dto';
import { QrResponseDto } from 'src/qr/dto/qr-response.dto';
import { toQrHttpResult } from 'src/qr/qr-endpoint.util';
import { CreateQrCodeDto, UpdateQrCodeDto } from './dto/qr-code.dto';
import { QrCodeResponseDto } from './dto/qr-code-response.dto';
import { QrCodesService } from './qr-codes.service';

@Controller('restaurants/:restaurantUuid/qr-codes')
@UseGuards(AuthGuard)
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Get()
  async findAll(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
  ) {
    const result = await this.qrCodesService.findAll(userId, restaurantUuid);
    return validateResponseDtoList(QrCodeResponseDto, result);
  }

  @Get(':qrCodeUuid/qr')
  async getQr(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('qrCodeUuid') qrCodeUuid: string,
    @Query() query: QrFormatQueryDto,
  ): Promise<QrResponseDto | StreamableFile> {
    const result = await this.qrCodesService.getQr(
      userId,
      restaurantUuid,
      qrCodeUuid,
      query.format,
    );

    return toQrHttpResult(result, (payload) =>
      validateResponseDto(QrResponseDto, payload),
    );
  }

  @Get(':qrCodeUuid')
  async findOne(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('qrCodeUuid') qrCodeUuid: string,
  ) {
    const result = await this.qrCodesService.findOne(
      userId,
      restaurantUuid,
      qrCodeUuid,
    );
    return validateResponseDto(QrCodeResponseDto, result);
  }

  @Post()
  async create(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Body() dto: CreateQrCodeDto,
  ) {
    const result = await this.qrCodesService.create(
      userId,
      restaurantUuid,
      dto,
    );
    return validateResponseDto(QrCodeResponseDto, result);
  }

  @Patch(':qrCodeUuid')
  async update(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('qrCodeUuid') qrCodeUuid: string,
    @Body() dto: UpdateQrCodeDto,
  ) {
    const result = await this.qrCodesService.update(
      userId,
      restaurantUuid,
      qrCodeUuid,
      dto,
    );
    return validateResponseDto(QrCodeResponseDto, result);
  }

  @Delete(':qrCodeUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('qrCodeUuid') qrCodeUuid: string,
  ): Promise<void> {
    await this.qrCodesService.remove(userId, restaurantUuid, qrCodeUuid);
  }
}
