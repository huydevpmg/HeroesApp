export interface AuthResponseModel {
  accessToken: string;
  user?: {
    _id: string;
    username: string;
  };
}
