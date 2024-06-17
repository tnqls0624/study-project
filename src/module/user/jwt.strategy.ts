import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './interface/user.repository';
import { Schema } from 'mongoose';
import { CACHE_GENERATOR } from 'src/lib/cache.module';

export type Payload = {
  _id: Schema.Types.ObjectId;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
    @Inject(CACHE_GENERATOR) private readonly cacheGenerator: CACHE_GENERATOR,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET || 'secret',
    });
  }

  async validate(payload: Payload) {
    const { _id } = payload;
    // const is_valid = await this.cacheGenerator.getCache(`token:${_id}`);
    // if (!is_valid) throw new UnauthorizedException();
    const user = await this.userRepository.findById(_id);
    return {
      _id: String(user._id),
      user_id: user.user_id,
      name: user.name,
    };
  }
}
