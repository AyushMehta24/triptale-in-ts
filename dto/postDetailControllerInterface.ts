export interface postDetailqueryInterface {
  username: string;
  location: string;
  like_count: number;
  comment_count: number;
  descriptions: string;
  ismultiple: number;
  image: string;
  profile_image: string;
  isvideo: number;
}

export interface postDetailqueryInterfacePart {
  username: string;
  location: string;
  like_count: number;
  comment_count: number;
  descriptions: string;
  ismultiple: number;
  image: Array<string>;
  profile_image: string;
  isvideo: Array<number>;
}

export interface postDetailqueryInterfaceAcc{
  [x:string] : postDetailqueryInterfacePart
}