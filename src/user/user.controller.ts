import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';

import { Request } from 'express';
import { UserService } from './user.service';
import {
  CreateIssue,
  GetIssueDetail,
  UpdateUser,
  SearchIssue,
} from './type/type';

import { GithubGuard } from '../auth/github/github.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../config/types/user';
import { InternalServerError } from '../common/httpError';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('github/login')
  @UseGuards(GithubGuard)
  async githubAuth() {
    return { msg: 'Github Authentication' };
  }

  @Get('github/redirect')
  @UseGuards(GithubGuard)
  async githubAuthCallback(@Req() req: Request, @Res() res) {
    if (!req.user) throw new InternalServerError();
    const result = req.user as User;
    res.redirect(`${process.env.FRONTEND_URL}?token=${result.token}`);
  }

  @Get('getUserData')
  @UseGuards(JwtAuthGuard)
  async getUserData(@Req() req: Request) {
    return req.user;
  }

  @Get('getRepos')
  @UseGuards(JwtAuthGuard)
  async findRepos(@Req() req: Request, @Query() query: any) {
    const { username, token } = req.user as User;
    const result = await this.userService.findRepos(
      username,
      token,
      query.page,
    );
    return result;
  }

  @Get('getIssue')
  @UseGuards(JwtAuthGuard)
  async getIssue(@Query() query: any, @Req() req: Request) {
    const { token, username } = req.user as User;
    const userData: GetIssueDetail = {
      owner: username,
      access_token: token,
      ...query,
    };
    return await this.userService.getIssue(userData);
  }

  @Post('createIssue')
  @UseGuards(JwtAuthGuard)
  async createIssue(@Body() body: any, @Req() req: Request) {
    const { token, username } = req.user as User;
    const userData: CreateIssue = {
      owner: username,
      access_token: token,
      ...body,
    };

    return await this.userService.createIssue(userData);
  }

  @Patch('updateIssue')
  @UseGuards(JwtAuthGuard)
  async update(@Body() updateUser: UpdateUser, @Req() req: Request) {
    const { token, username } = req.user as User;
    const userData: UpdateUser = {
      owner: username,
      access_token: token,
      ...updateUser,
    };

    return await this.userService.update(userData);
  }

  @Get('searchIssue')
  @UseGuards(JwtAuthGuard)
  async search(@Query() query: any, @Req() req: Request) {
    const { token, username } = req.user as User;
    const userData: SearchIssue = {
      access_token: token,
      owner: username,
      ...query,
    };
    return await this.userService.search(userData);
  }
}
