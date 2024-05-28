import { FieldPacket, QueryResult, ResultSetHeader } from "mysql2";

export type dataSet = [QueryResult, FieldPacket[]];
export type UpdateSet = [ResultSetHeader , FieldPacket[]]
export type insertSet = [ResultSetHeader , FieldPacket[]]
export type deleteSet = [QueryResult , FieldPacket[]]
