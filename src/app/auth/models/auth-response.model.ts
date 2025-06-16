import { User } from "./user.model";

export interface AuthResponseModel {
  accessToken: string;
  user?: {
    _id: string;
    username: string;
  };
}
