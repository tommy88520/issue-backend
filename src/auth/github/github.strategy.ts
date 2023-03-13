import { Injectable } from '@nestjs/common';
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
        'public_repo',
        'write:discussion',
      ],
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    const { id, emails, username, photos, displayName } = profile;
    const payload = {
      email: emails[0].value,
      token: accessToken,
      username: username,
    };
    const token = await this.jwtService.signAsync(payload);
    const result: User = {
      id,
      username,
      displayName,
      photos,
      access_token: accessToken,
      email: emails[0].value,
      token,
    };

    return result;
  }
}
