import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { CreateIssue } from './dto/create-issue.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserIssueDto } from './dto/get-user-issue.dto';
import { GetIssueDetailDto } from './dto/get-issue-detail.dto';
import { SearchIssueDto } from './dto/search-issue.dto';
import { Issues, IssueDetail } from './type/type';

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

  async findRepos(user: string, access_token: string, page: number) {
    const result = await userRequest
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
        console.error(error);
      });
    return result;
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
        console.error(error.code);
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
        console.error(error.code);
        return null;
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
        console.error(error);
      });
    if (result) return '修改成功';
  }

  async search(query: SearchIssueDto) {
    const { access_token, owner, repo, q, params, label } = query;
    const labels = label ? `+is:issue+label:"${label}"` : '';
    const result = await userRequest
      //https://github.com/tommy88520/clown_backend/issues?q=is:open+is:issue+label:"In+progress"+issue
      .get(
        `search/issues?q=${q}+is:open+is:issue+repo:${owner}/${repo}${labels}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          params,
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
        // console.log(allIssues);

        return allIssues;
      })
      .catch((error) => {
        console.error(error);
      });
    return result;
  }
}
