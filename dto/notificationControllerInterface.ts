export interface notificationUser {
  user_id: number;
}

export interface accumalator {
  [x: string]: notificationType;
}

export interface multiPostItem {
  id: string | number;
  like_by: string;
  user_id: string;
  content: string;
  image: string;
  username: string;
  profile_image: string;
  first_name: string;
  last_name: string;
  create_at: string;
  isvideo: string;
  post_id: string;
  comment_by?:string
}

export interface notificationType {
  [index: string]: string | Array<string | number>;
  post_id: Array<string | number>;
}

export interface postData {
  id: string;
  post_id: string;
  comment_by: string;
  comments: string;
  create_at: string;
  delete_at: string;
}

export interface postimages {
  id: string;
  post_id: string;
  image: string;
  is_video: string;
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  bio: string;
  comment_by?:string
}
