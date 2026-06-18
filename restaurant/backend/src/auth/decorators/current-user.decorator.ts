import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ITokenPayload } from 'src/types/token';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ITokenPayload => {
    const request = context.switchToHttp().getRequest<Request>();
    return request['user'] as ITokenPayload;
  },
);

export function getCurrentUserId(user: { uid: string | number }): number {
  return Number(user.uid);
}
