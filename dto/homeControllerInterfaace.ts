export interface getHomeInterface {
  id: number;
  userId: number;
  username: string;
  image: string;
  ismultiple: number;
  location: string;
  profile_image: string;
  like_count: number;
  comment_count: number;
  isdeleted?: number;
  caption: string;
  create_at: number | string;
  privacy: string;
  isvideo: number;
  flag?: string;
  save_posts?: string;
}

export interface getHomeInterfacePart {
  id: number;
  userId: number;
  username: string;
  image: Array<string>;
  ismultiple: number;
  location: string;
  profile_image: string;
  privacy: string;
  like_count: number;
  comment_count: number;
  caption: string;
  create_at: Date;
  flag: Number;
  save_posts: number | null;
  isvideo: Array<number>;

}

export interface getHomeInterfaceAcc {
  [x: string]: getHomeInterfacePart;
}

export interface getProfileInterface {
  profile_image: string;
  user_id: number;
}

export interface LikeCountInterface {
  like_count: number;
}
