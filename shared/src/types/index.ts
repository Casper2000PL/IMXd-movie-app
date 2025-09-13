export type ApiResponse = {
  message: string;
  success: true;
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
