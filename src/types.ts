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
