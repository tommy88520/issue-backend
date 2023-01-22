export class SearchIssueDto {
  access_token: string;
  owner: string;
  repo: string;
  q: string;
  params: {
    sort: string;
    order: string;
    per_page: number;
    page: number;
  };
}