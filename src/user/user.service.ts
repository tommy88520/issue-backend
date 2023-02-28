import axios from 'axios';
import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { UnauthorizedException } from '../common/httpError';
import { CreateIssue } from './dto/create-issue.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserIssueDto } from './dto/get-user-issue.dto';
import { GetIssueDetailDto } from './dto/get-issue-detail.dto';
import { SearchIssueDto } from './dto/search-issue.dto';
import { Issues, IssueDetail } from './type/type';
import { Cache } from 'cache-manager';

import { paginatedResults } from '../utils/paging';
const userRequest = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
  },
});
@Injectable()
export class UserService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

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
        throw new UnauthorizedException(error.code);
      });
    if (result) return '新增成功';
  }

  async findRepos(user: string, access_token: string, page: number) {
    const userRepos = await userRequest
      .get(`users/${user}/repos`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          page,
          per_page: 10,
          sort: 'updated',
        },
      })
      .then((res) => {
        const userData = [];
        res.data.forEach((item) => {
          userData.push(item.name);
        });
        return userData;
      })
      .catch((error) => {
        throw new UnauthorizedException(error.code);
      });

    return userRepos as string[];
  }

  async getAllIssues(userData: GetUserIssueDto): Promise<Issues[]> {
    const { owner, repo, access_token, query } = userData;
    const result = await userRequest
      .get(`/repos/${owner}/${repo}/issues`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: query,
      })
      .then((res) => {
        const allIssues = [];
        res.data.forEach((item) => {
          const { title, number, labels, created_at, body } = item;
          const label = labels.length
            ? { name: labels[0].name, description: labels[0].description }
            : { name: '', description: '' };
          allIssues.push({ title, number, label, created_at, body });
        });
        return allIssues;
      })
      .catch((error) => {
        throw new UnauthorizedException(error.code);
      });

    return result as Issues[];
  }

  async getIssue(userData: GetIssueDetailDto): Promise<IssueDetail> {
    const { owner, repo, issue_number, access_token } = userData;
    const result = await userRequest
      .get(`/repos/${owner}/${repo}/issues/${issue_number}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((res) => {
        const { title, number, labels, body, created_at } = res.data;
        const label = labels.length
          ? { name: labels[0].name, description: labels[0].description }
          : { name: '', description: '' };

        return {
          title,
          number,
          label,
          body,
          created_at,
        };
      })
      .catch((error) => {
        throw new UnauthorizedException(error.code);
      });
    return result as IssueDetail | null;
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
        throw new UnauthorizedException(error.code);
      });
    if (result) return 'Success!';
  }

  async search(query: SearchIssueDto) {
    const { access_token, owner, repo, q, params, label, noCache } = query;
    const { page, sort, order } = params;
    if (!q && !label && noCache === 'false') {
      const val = await this.cacheManager.get(`user:${repo}:allIssues`);
      if (val) {
        const result = paginatedResults(page, 10, val);
        return result;
      }
    }

    if (!q && label && noCache === 'false') {
      switch (label) {
        case 'Open':
          const openVal = await this.cacheManager.get(
            `user:${repo}:allIssues:open`,
          );
          if (openVal) {
            const result = paginatedResults(page, 10, openVal);
            return result;
          }
          break;
        case 'In progress':
          const progressVal = await this.cacheManager.get(
            `user:${repo}:allIssues:inProgress`,
          );
          if (progressVal) {
            const result = paginatedResults(page, 10, progressVal);
            return result;
          }
          break;
        case 'Done':
          const doneVal = await this.cacheManager.get(
            `user:${repo}:allIssues:done`,
          );
          if (doneVal) {
            const result = paginatedResults(page, 10, doneVal);
            return result;
          }
          break;
        default:
          const val = await this.cacheManager.get('user:allIssues');
          if (val) {
            const result = paginatedResults(page, 10, val);
            return result;
          }
      }
    }

    const labels = label ? `+is:issue+label:"${label}"` : '';

    const userIssues = await userRequest
      .get(
        `search/issues?q=${q}+is:open+is:issue+repo:${owner}/${repo}${labels}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          params: {
            sort,
            order,
          },
        },
      )
      .then((res) => {
        const allIssues = [];
        res.data.items.forEach((item) => {
          const { title, number, labels, created_at, body } = item;
          const label = labels.length
            ? { name: labels[0].name, description: labels[0].description }
            : { name: '', description: '' };
          allIssues.push({ title, number, label, created_at, body });
        });
        return allIssues;
      })
      .catch((error) => {
        throw new UnauthorizedException(error.code);
      });
    const result = paginatedResults(params.page, 10, userIssues);
    if (!q && !label && result.length) {
      await this.cacheManager.set(`user:${repo}:allIssues`, userIssues);
    }
    if (!q && label && result.length) {
      switch (label) {
        case 'Open':
          await this.cacheManager.set(
            `user:${repo}:allIssues:open`,
            userIssues,
          );
          break;
        case 'In progress':
          await this.cacheManager.set(
            `user:${repo}:allIssues:inProgress`,
            userIssues,
          );
          break;
        case 'Done':
          await this.cacheManager.set(
            `user:${repo}:allIssues:done`,
            userIssues,
          );
          break;
        default:
          await this.cacheManager.set(`user:${repo}:allIssues`, userIssues);
      }
    }
    return result as IssueDetail[];
  }
}
