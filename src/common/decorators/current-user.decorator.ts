import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '../../auth/jwt.strategy';

/**
 * Pulls the user that `JwtStrategy.validate` attached to the request.
 * Always used behind `JwtAuthGuard`, so the value is non-null by construction.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return data ? request.user?.[data] : request.user;
  },
);
