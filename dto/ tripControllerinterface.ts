import { usernameTrip } from "./displaytripcontrollerInterface";
import { uniqueLocation } from "./searchControllerInterface";
export interface newUser {
  user_id: string;
}

export interface locationInterface {
  location: string;
}

export interface tripEventDetail {
  trip_id: string;
  start_date: string;
  end_date: string;
}

export interface allTripDetails {
  start_time: number;
  end_time: number;
}

export interface tripeventUpdateDataInterface {
  title: string;
  discription: string;
  start_time: string;
  end_time: string;
  image?: string;
}

export interface userlist {
  user_id: number;
}

export interface useProfileDetail {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  user_bio: string;
  user_dob: string;
  city_id: null;
  gender: string;
  profile_image: string;
  create_at: string;
  update_at: string;
}

export interface tripDetailsInterface {
  trip_id: number;
  user_id: number;
  title: string;
  discription: string;
  start_date: Date;
  end_date: Date;
  trip_type_id: number;
  cover_image: string;
  latitude: string;
  longitude: string;
  location: string;
  created_at: string;
  update_at: string;
  deleted_at: string;
  deleted_by: string;
}

export interface datesSDED {
  sd: Date;
  ed: Date;
}

export interface tripIdList {
  trip_id: string;
}

export interface idList {
  id: number;
}

export interface editMembers {
  profile_image: string;
  username: string;
  user_id: number;
  trip_id: number;
}

export interface idDetails {
  trip_id: number;
  user_id: number;
}

export interface tripInfo {
  user_id: string;
  title: string;
  discription: string;
  start_date: string;
  end_date: string;
  trip_type_id: string;
  cover_image: string;
  location: string;
}

export interface memberInfo {
  trip_id: number;
  user_id: number;
}

export interface notificationTripinfo {
  trip_id: number;
  create_user_id: string;
  add_user_id: number;
}

export interface updateDataInfo {
  title: string;
  discription: string;
  location: string;
}

export interface daybydayInfo {
  trip_id: string;
  discription: string;
  title: string;
  location: string;
  dates: string;
}
