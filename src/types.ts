import { Timestamp } from 'firebase/firestore';

export type MediaType = 'image' | 'youtube';

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  order: number;
}

export interface Software {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: MediaType;
  isFeatured?: boolean;
  version?: string;
  category?: string;
  subcategory?: string;
  downloadUrl?: string;
  downloadUrl2?: string;
  tags?: string[];
  isPremium?: boolean;
  specialNote?: string;
  createdAt: Timestamp;
  authorUid: string;
}

export interface Comment {
  id: string;
  nickname: string;
  content: string;
  createdAt: Timestamp;
  parentId?: string;
}

export type UserRole = 'admin' | 'moderator' | 'user';

export interface UserProfile {
  uid: string;
  nickname: string;
  email?: string;
  role: UserRole;
  createdAt?: any;
}
