export interface tripInfo {
  cover_image: string;
  trip_id: number;
  start_date: string;
  title: string;
  discription: string;
  user_id: number;
  image:string
}

export interface tripDetails {
  id: number;
  trip_id: number;
  title: string;
  discription: string;
  image: string;
  start_time: string;
  end_time: string;
  created_by: number;
}

export interface chatId {
  id: number;
}

export interface tripChat {
  message: string;
  username: string;
  user_id: number;
  created_at: string;
  userId: number;
  userName: string;
}

export interface usernameTrip {
  username: string;
}

export interface newChat {
  message: string;
  username: string;
  user_id: number;
  created_at: object | number;
}
