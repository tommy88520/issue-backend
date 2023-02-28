export class CreateIssue {
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
