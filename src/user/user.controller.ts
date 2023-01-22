import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { CreateIssue } from './dto/create-issue.dto';
import { GetIssueDetailDto } from './dto/get-issue-detail.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserIssueDto } from './dto/get-user-issue.dto';
import { GithubGuard } from '../auth/github/github.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../config/types/user';
import { SearchIssueDto } from './dto/search-issue.dto';

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
  async githubAuthCallback(@Req() req: Request) {
    const result = req.user as User;
    return result;
  }

  @Get('getRepos')
  @UseGuards(JwtAuthGuard)
  async findRepos(@Req() req: Request) {
    const { username, token } = req.user as User;

    const result = await this.userService.findRepos(username, token);
    return result;
  }
  @Get('getAllIssues')
  @UseGuards(JwtAuthGuard)
  async findAllIssues(@Body() body: any, @Req() req: Request) {
    const { token } = req.user as User;
    const userData: GetUserIssueDto = {
      access_token: token,
      per_page: 10,
      ...body,
    };

    return await this.userService.getAllIssues(userData);
  }

  @Get('getIssue')
  @UseGuards(JwtAuthGuard)
  async getIssue(@Body() body: any, @Req() req: Request) {
    const { token } = req.user as User;
    const userData: GetIssueDetailDto = {
      access_token: token,
      ...body,
    };
    return await this.userService.getIssue(userData);
  }

  @Post('createIssue')
  @UseGuards(JwtAuthGuard)
  async createIssue(@Body() body: any, @Req() req: Request) {
    const { token } = req.user as User;
    const userData: CreateIssue = {
      access_token: token,
      ...body,
    };

    return await this.userService.createIssue(userData);
  }

  @Patch('editIssue')
  @UseGuards(JwtAuthGuard)
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const { token } = req.user as User;
    const userData: UpdateUserDto = {
      access_token: token,
      ...updateUserDto,
    };
    return await this.userService.update(userData);
  }

  @Get('searchIssue')
  @UseGuards(JwtAuthGuard)
  async search(@Body() body: any, @Req() req: Request) {
    const { token } = req.user as User;
    const userData: SearchIssueDto = {
      access_token: token,
      ...body,
    };

    return await this.userService.search(userData);
  }
}