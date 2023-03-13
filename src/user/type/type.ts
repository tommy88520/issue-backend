import { PartialType } from '@nestjs/mapped-types';
class Issues {
  title: string;
  number: number;
  label: {
    name: string;
    description: string;
  };
  created_at: Date;
}

class IssueDetail {
  title: string;
  number: number;
  label: {
    name: string;
    description: string;
  };
  body: string;
  created_at: Date;
}

class CreateIssue {
  access_token: string;
  owner: string;
  repo: string;
  issue: {
    title: string;
    body: any;
    labels: string;
    state: string;
  };
}

class UpdateUser extends PartialType(CreateIssue) {
  issue_number: number;
}

class SearchIssue {
  access_token: string;
  owner: string;
  repo: string;
  q: string;
  label: string;
  sort: string;
  order: string;
  per_page: number;
  page: number;
  noCache: string;
}
class GetUserIssue {
  access_token: string;
  owner: string;
  repo: string;
  query: {
    state: string;
    labels: string;
    sort: string;
    direction: string;
    per_page: number;
    page: number;
  };
}
class GetIssueDetail {
  owner: string;
  repo: string;
  issue_number: number;
  access_token: string;
}

export {
  Issues,
  IssueDetail,
  CreateIssue,
  UpdateUser,
  SearchIssue,
  GetUserIssue,
  GetIssueDetail,
};
