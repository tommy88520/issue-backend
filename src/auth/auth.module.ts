import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { GithubStrategy } from './github/github.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('SECRET_KEY'),
          signOptions: {
            expiresIn: '600s',
          },
        };
      },
    }),
  ],
  providers: [AuthService, GithubStrategy, JwtStrategy],
})
export class AuthModule {}
