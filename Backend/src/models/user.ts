export interface CreateUserDTO {
  email: string;
  password: string;
  fullName: string;
  collegeName?: string;
  company?: string;
  role?: 'STUDENT' | 'CORPORATE';
}

export interface UpdateUserDTO {
  fullName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  collegeName?: string;
  company?: string;
}
