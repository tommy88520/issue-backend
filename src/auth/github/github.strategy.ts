import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { User } from '../../config/types/user';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_ID'),
      clientSecret: configService.get<string>('GITHUB_SECRET_KEY'),
      callbackURL: `${configService.get<string>(
        'BACKEND_URL',
      )}/user/github/redirect`,
      scope: [
        'workflow',
        'codespace',
        'user:email',
        'repo',
        'write:discussion',
      ],
      // scope: ['user:email'],
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    const payload = {
      email: profile.emails[0].value,
      token: accessToken,
      username: profile.username,
    };
    const token = await this.jwtService.signAsync(payload);
    const result: User = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      photos: profile.photos,
      access_token: accessToken,
      email: profile.emails[0].value,
      token,
    };

    return result;
  }
}
