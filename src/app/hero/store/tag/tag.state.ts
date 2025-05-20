import { Tag } from "../../models/tag.model";

export interface TagState {
  tags: Tag[];
  error: any;
  loading: boolean;
}

export const initialState: TagState = {
  tags: [],
  error: null,
  loading: false,
};
