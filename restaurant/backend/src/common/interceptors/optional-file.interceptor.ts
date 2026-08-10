import {
  CallHandler,
  ExecutionContext,
  Injectable,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Observable } from 'rxjs';

/**
 * Runs FileInterceptor only for multipart requests so JSON PUTs still work.
 */
export function OptionalFileInterceptor(
  fieldName: string,
  localOptions?: Parameters<typeof FileInterceptor>[1],
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    private readonly fileInterceptor = new (FileInterceptor(
      fieldName,
      localOptions,
    ))();

    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<unknown> | Promise<Observable<unknown>> {
      const request = context.switchToHttp().getRequest<{
        headers: { 'content-type'?: string };
      }>();
      const contentType = request.headers['content-type'] ?? '';

      if (!contentType.includes('multipart/form-data')) {
        return next.handle();
      }

      return this.fileInterceptor.intercept(context, next);
    }
  }

  return mixin(MixinInterceptor);
}
