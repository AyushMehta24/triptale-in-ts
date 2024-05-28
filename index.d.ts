export interface ProfileImage {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface UserId {
  userId: string;
  iat: string;
}

declare global {
  namespace Express {
    interface Request {
      file?: ProfileImage;
      user?: UserId;
      files?: ProfileImage[];
    }
  }
}

export default Request;
