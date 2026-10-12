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

export type SupportIconType =
  | 'discord'
  | 'twitter'
  | 'mastodon'
  | 'matrix'
  | 'telegram'
  | 'github'
  | 'reddit'
  | 'youtube'
  | 'twitch'
  | 'steam'
  | 'patreon'
  | 'kofi'
  | 'coffee'
  | 'heart'
  | 'gift'
  | 'dollar'
  | 'link'
  | 'globe';

export interface CustomSupportLink {
  id: string;
  title: string;
  url: string;
  icon: SupportIconType;
  color?: string;
  enabled: boolean;
}

export interface SupportSettings {
  patreonUrl: string;
  patreonEnabled: boolean;
  patreonLabel?: string;
  kofiUrl: string;
  kofiEnabled: boolean;
  kofiLabel?: string;
  customLinks: CustomSupportLink[];
  heading?: string;
  showOnHome?: boolean;
}

export interface VisitorSession {
  id?: string;
  sessionId: string;
  visitorId: string;
  isBot: boolean;
  botName?: string | null;
  isMember: boolean;
  userId?: string | null;
  userNickname?: string | null;
  userRole?: UserRole | null;
  path: string;
  referrer: string;
  device: string;
  browser: string;
  os: string;
  screen?: string;
  language?: string;
  pageViews: number;
  startedAt: any;
  lastActive: any;
}

export interface VisitorLog {
  id?: string;
  visitorId: string;
  sessionId: string;
  isBot: boolean;
  botName?: string | null;
  isMember: boolean;
  userId?: string | null;
  userNickname?: string | null;
  path: string;
  referrer: string;
  device: string;
  browser: string;
  os: string;
  userAgent: string;
  timestamp: any;
}

