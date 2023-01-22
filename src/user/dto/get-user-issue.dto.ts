export class GetUserIssueDto {
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
