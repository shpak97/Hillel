export interface IAccessTokenResponse {
  accessToken: string;
}

export interface ILoginResponse extends IAccessTokenResponse {
  refreshToken: string;
}
