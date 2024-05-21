export interface uniqueUsername {
  username: string;
}

export interface uniqueHashtag {
  name: string;
}

export interface uniqueLocation {
  location: string;
}

export interface uniqueCount {
  counter: number;
}

export interface uniquePost {
  post_id: number;
}

export interface manyPosts {
  user_id: number;
  id: number;
  ismultiple: number;
  image: string;
  isvideo: number;
}
