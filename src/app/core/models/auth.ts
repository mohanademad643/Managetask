

export interface RegisterRequest {
  email: string;
  password: string;
  data: {
    name: string;
    department: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface AppMetadata {
  provider: string;
  providers: string[];
}

export interface UserMetadata {
  department: string;
  email: string;
  email_verified: boolean;
  name: string;
  phone_verified: boolean;
  sub: string;
}

export interface Identity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: UserMetadata;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface AuthUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  last_sign_in_at: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  identities: Identity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: AuthUser;
}

export interface AuthErrorResponse {
  code: number;
  error_code: string; 
  msg: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number; 
  user: AuthUser;
}

export type UserProfile = Pick<UserMetadata, 'name' | 'email' | 'department'>;

export interface AppHttpError {
  type: 'error' | 'unauthorized';
  status?: number;
  message: string;
}
 