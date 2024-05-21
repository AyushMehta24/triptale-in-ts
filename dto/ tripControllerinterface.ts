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
