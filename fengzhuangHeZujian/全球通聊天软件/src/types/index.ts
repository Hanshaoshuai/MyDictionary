export interface UserDto {
  uid: string;
  email: string;
  username: string;
  organization: string;
  type: number;
  created: string;
}

export enum IModelState {
  Initial = 0,
  Converting,
  Converted,
  Failed,
}
