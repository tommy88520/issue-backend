export interface Issues {
  title: string;
  number: number;
  label: {
    name: string;
    description: string;
  };
  created_at: Date;
}

export interface IssueDetail {
  title: string;
  number: number;
  label: {
    name: string;
    description: string;
  };
  body: string;
  created_at: Date;
}
