export class CreateIssue {
  access_token: string;
  owner: string;
  repo: string;
  issue: {
    title: string;
    body: any;
    label: string;
    state: string;
  };
}
