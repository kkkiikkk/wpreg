import { ExtractJwt } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
}

export type JwtFromRequestFunction = ReturnType<
  typeof ExtractJwt.fromAuthHeaderAsBearerToken
>;

export type JwtConfig = {
  jwtFromRequest: JwtFromRequestFunction;
  ignoreExpiration: boolean;
  secretOrKey: string;
};
