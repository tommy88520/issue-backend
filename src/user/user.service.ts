import axios from 'axios';
import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { UnauthorizedException, BadRequestError } from '../common/httpError';
import {
  IssueDetail,
  SearchIssue,
  GetIssueDetail,
  UpdateUser,
  CreateIssue,
} from './type/type';
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

  async findRepos(
    user: string,
    access_token: string,
    page: number,
  ): Promise<string[]> {
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

    return userRepos;
  }

  async getIssue(userData: GetIssueDetail): Promise<IssueDetail | null> {
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
    return result;
  }

  async update(userData: UpdateUser) {
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

  async search(query: SearchIssue): Promise<IssueDetail[]> {
    const { access_token, owner, repo, q, page, sort, order, label, noCache } =
      query;
    if (!q && !label && noCache === 'false') {
      const val = await this.cacheManager.get(`user:${repo}:allIssues`);
      if (val) {
        const result = paginatedResults(page, 10, val, order);
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
            const result = paginatedResults(page, 10, openVal, order);
            return result;
          }
          break;
        case 'In progress':
          const progressVal = await this.cacheManager.get(
            `user:${repo}:allIssues:inProgress`,
          );
          if (progressVal) {
            const result = paginatedResults(page, 10, progressVal, order);
            return result;
          }
          break;
        case 'Done':
          const doneVal = await this.cacheManager.get(
            `user:${repo}:allIssues:done`,
          );
          if (doneVal) {
            const result = paginatedResults(page, 10, doneVal, order);
            return result;
          }
          break;
        default:
          const val = await this.cacheManager.get('user:allIssues');
          if (val) {
            const result = paginatedResults(page, 10, val, order);
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
            // order,
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
        console.log(error);
        if (error.response.status == 401) {
          throw new UnauthorizedException(error.code);
        } else {
          throw new BadRequestError();
        }
      });

    const result = paginatedResults(page, 10, userIssues, order);
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
    return result;
  }
}
