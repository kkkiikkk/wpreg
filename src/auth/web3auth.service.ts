import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jose from 'jose';
const { jwtVerify, createRemoteJWKSet } = jose;
import { computeAddress } from 'ethers';

@Injectable()
export class Web3AuthService {
  private readonly _WEB3AUTH_JWKS_URL =
    'https://api-auth.web3auth.io/.well-known/jwks.json';
  private readonly _JWKS = createRemoteJWKSet(new URL(this._WEB3AUTH_JWKS_URL));
  constructor() {}

  async verifyWeb3AuthToken(idToken: string) {
    try {
      const { payload } = await jwtVerify(idToken, this._JWKS, {
        algorithms: ['ES256'],
      });

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  getWallet(wallets): any {
    const secpKey = wallets.find(
      (w) => w.curve === 'secp256k1' && w.type === 'web3auth_app_key',
    )?.public_key;
    if (!secpKey) throw new Error('No secp256k1 key found issn idToken');

    const wallet = computeAddress(`0x${secpKey}`) || '';

    return wallet;
  }
}
