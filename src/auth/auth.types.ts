import { ExtractJwt } from 'passport-jwt';

export interface JwtPayload {
  userId: string;
}

export type JwtFromRequestFunction = ReturnType<
  typeof ExtractJwt.fromAuthHeaderAsBearerToken
>;

export type JwtConfig = {
  jwtFromRequest: JwtFromRequestFunction;
  ignoreExpiration: boolean;
  secretOrKey: string;
};
// export interface
