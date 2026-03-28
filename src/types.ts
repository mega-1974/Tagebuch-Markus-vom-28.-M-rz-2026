/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Mood {
  VERY_LOW = 1,
  LOW = 2,
  NEUTRAL = 3,
  GOOD = 4,
  EXCELLENT = 5,
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: string; // ISO 8601
  mood: Mood;
  content: string;
  tags: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
}

export interface DiaryDocument {
  id: string;
  userId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface AISummary {
  id: string;
  userId: string;
  title: string;
  content: string;
  sourceIds: string[];
  sourceType: 'entry' | 'document' | 'mixed';
  createdAt: string;
}

export interface TrashItem {
  id: string;
  userId: string;
  originalId: string;
  type: 'entry' | 'document' | 'summary';
  data: any;
  originalPath: string;
  deletedAt: string;
}
