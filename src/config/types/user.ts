export interface User {
  id: string;

  username: string;

  displayName: string;

  photos: {
    value: string;
  }[];

  access_token: string;

  email: {
    value: string;
  }[];
  token: string;
}
