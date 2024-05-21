import { AssertionError } from "assert";

export interface multiplePostAccPart {
  id: number;
  albums_name: string;
  post_id: Array<string>;
  //   image?: string;
  isdeleted: string;
  isvideo: Array<number>;
  user_id?: number;
}

export interface multiplePostItem {
  id: number;
  albums_name: string;
  post_id: string;
  image: string;
  isdeleted: string;
  isvideo: number;
  user_id: number;
}

export interface multiplePostAcc {
  [x: string]: multiplePostAccPart;
}

export interface FetchPostInterface {
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  profile_image: string;
  id: number;
  location: string;
  like_count: string;
  comment_count: string;
  ismultiple: number;
  caption: string;
  descriptions: string;
  image: string;
  isvideo: number;
}

export interface FetchPostInterfacePart {
  id: number;
  user_id: number;
  image: Array<string>;
  isvideo: Array<number>;
}

export interface FetchPostInterfaceAcc {
  [x: string]: FetchPostInterfacePart;
}

export interface fetchPopupPostsInterface {
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  profile_image: string;
  id: number;
  location: string;
  like_count: string;
  comment_count: string;
  ismultiple: number;
  caption: string;
  descriptions: string;
  image: string;
}

export interface fetchPopupPostsInterfacePart {
  id: number;
  user_id: number;
  image: Array<string>;
  ismultiple: number;
  username: string;
  location: string;
  like_count: string;
  profile_image: string;
  comment_count: string;
  caption: string;
}

export interface fetchPopupPostsInterfaceAcc {
  [x: string]: fetchPopupPostsInterfacePart;
}

export interface fetchTagePostInterface {
  user_id: number;
  post_id: number;
  users: number;
  location: string;
  like_count: number;
  isdeleted: number;
  comment_count: number;
  ismultiple: number;
  caption: string;
  descriptions: string;
  image: string;
  isvideo: number;
  first_name: string;
  last_name: string;
  username: string;
  profile_image: string;
}

export interface fetchTagePostInterfacePart {
  id: number;
  user_id: number;
  image: Array<string>;
  profileId: string;
  isvideo: Array<number>;
}

export interface fetchTagePostInterfaceAcc {
  [x: string]: fetchTagePostInterfacePart;
}

export interface fetchOneAlbumsPostInterface {
  id: number;
  user_id: number;
  album_name: string;
  post_id: number;
  image: string;
  isvideo: number;
  isdeleted: number;
}

export interface fetchOneAlbumsPostInterfacePart {
  id: number;
  user_id: number;
  image: Array<string>;
  profileId: string;
  albumId?: string;
  isvideo: Array<number>;
}
export interface fetchOneAlbumsPostInterfaceAcc {
  [x: string]: fetchOneAlbumsPostInterfacePart;
}

export interface otherPostShowInAlbumsInterface {
  user_id: number;
  post_id: number;
  isvideo: number;
  image: string;
  singleImageId: number;
}

interface otherPostShowInAlbumsInterfacePart {
  id: number;
  user_id: number;
  profileId: string;
  albumId: number;
  image: Array<string>;
  isvideo: Array<number>;
}

export interface otherPostShowInAlbumsInterfaceAcc {
  [x: string]: otherPostShowInAlbumsInterfacePart;
}

export interface onepostInterface {
  id: number;
  user_id: number;
  location: string;
  like_count: number;
  ismultiple: number;
  caption: string;
  descriptions: string;
  image: string;
  isvideo: number;
}

interface onepostInterfacePart {
  id: number;
  user_id: number;
  location: string;
  like_count: number;
  ismultiple: number;
  caption: string;
  descriptions: string;
  image: Array<string>;
  isvideo: Array<number>;
}

export interface onepostInterfaceAcc {
  [x: string]: onepostInterfacePart;
}
