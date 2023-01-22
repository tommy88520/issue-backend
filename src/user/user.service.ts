import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { CreateIssue } from './dto/create-issue.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserIssueDto } from './dto/get-user-issue.dto';
import { GetIssueDetailDto } from './dto/get-issue-detail.dto';
import { SearchIssueDto } from './dto/search-issue.dto';

const userRequest = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
  },
});
@Injectable()
export class UserService {
  async createIssue(userData: CreateIssue) {
    const { access_token, owner, repo, issue } = userData;

    const result = await userRequest
      .post(`/repos/${owner}/${repo}/issues`, issue, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.error(error);
      });
    if (result) return '新增成功';
  }

  async findRepos(user: string, access_token: string) {
    const result = await userRequest
      .get(`users/${user}/repos`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          sort: 'updated',
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.error(error);
      });
    return result;
  }

  async getAllIssues(userData: GetUserIssueDto) {
    const { owner, repo, access_token, query } = userData;
    const result = await userRequest
      .get(`/repos/${owner}/${repo}/issues`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: query,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.error(error);
      });

    return result;
  }

  async getIssue(userData: GetIssueDetailDto) {
    const { owner, repo, issue_number, access_token } = userData;
    const result = await userRequest
      .get(`/repos/${owner}/${repo}/issues/${issue_number}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.error(error);
      });
    return result;
  }

  async update(userData: UpdateUserDto) {
    const { owner, repo, issue_number, access_token, issue } = userData;
    const result = await userRequest
      .patch(`/repos/${owner}/${repo}/issues/${issue_number}`, issue, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.error(error);
      });
    return result;
  }

  async search(query: SearchIssueDto) {
    const { access_token, owner, repo, q, params } = query;
    const result = await userRequest
      .get(`search/issues?q=${q}+is:issue+repo:${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.error(error);
      });
    return result;
  }
}
