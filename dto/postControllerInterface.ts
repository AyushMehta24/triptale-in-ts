export interface getUsersUserNameInterface {
  userName: string;
  profile_image: string;
}

export interface getHashTagInterface {
  name: string;
}

export interface postDetailInterface {
  user_id: string;
  location: string;
  privacy_id: number;
  ismultiple: number;
  caption?: string;
  descriptions?: string;
}

export interface insertPostImage {
  post_id: number;
  image: string;
  isvideo: number;
}

export interface idForuser {
  id: number;
}

export interface useridForuser {
  user_id: number;
}

export interface deletePost {
  isexists: number;
}

export interface updatePostForm {
  location: string;
  caption: string;
  description: string;
  privacy_id: number;
}

export interface updatePostInterface {
  location: string;
  privacy_id: number;
  caption?: string;
  descriptions?: string;
}

export interface HashTagName {
  id: number;
}

export interface UserProfileList {
  user_id: number;
}
