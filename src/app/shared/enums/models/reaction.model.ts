export interface Reaction {
  emoji: string;
  users: ReactionUser[];
}

export interface ReactionUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
}
