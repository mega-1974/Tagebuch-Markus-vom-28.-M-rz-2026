/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mood } from './types';

export const MOOD_LABELS: Record<Mood, string> = {
  [Mood.VERY_LOW]: 'Sehr schlecht',
  [Mood.LOW]: 'Schlecht',
  [Mood.NEUTRAL]: 'Neutral',
  [Mood.GOOD]: 'Gut',
  [Mood.EXCELLENT]: 'Sehr gut',
};

export const MOOD_COLORS: Record<Mood, string> = {
  [Mood.VERY_LOW]: '#ef4444', // red-500
  [Mood.LOW]: '#f97316',      // orange-500
  [Mood.NEUTRAL]: '#eab308',  // yellow-500
  [Mood.GOOD]: '#84cc16',      // lime-500
  [Mood.EXCELLENT]: '#22c55e', // green-500
};

export const MOOD_EMOJIS: Record<Mood, string> = {
  [Mood.VERY_LOW]: '😞',
  [Mood.LOW]: '🙁',
  [Mood.NEUTRAL]: '😐',
  [Mood.GOOD]: '🙂',
  [Mood.EXCELLENT]: '😊',
};
