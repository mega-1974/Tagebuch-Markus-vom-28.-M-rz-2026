/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiaryEntry, Mood } from '../types';
import { MOOD_LABELS, MOOD_COLORS, MOOD_EMOJIS } from '../constants';
import { MoodTrendChart } from './MoodTrendChart';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, Smile, Frown } from 'lucide-react';

interface StatsProps {
  entries: DiaryEntry[];
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

import { MoodCalendar } from './MoodCalendar';

export const Stats: React.FC<StatsProps> = ({ entries }) => {
  const totalEntries = entries.length;
  const averageMood =
    totalEntries > 0
      ? Math.round(entries.reduce((acc, curr) => acc + curr.mood, 0) / totalEntries)
      : 0;

  const moodCounts = entries.reduce((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const tagCounts = entries.reduce((acc, curr) => {
    curr.tags?.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  const distributionData = (Object.keys(MOOD_LABELS) as unknown as Mood[]).map((mood) => ({
    name: MOOD_LABELS[Number(mood) as Mood],
    count: moodCounts[Number(mood)] || 0,
    mood: Number(mood),
  }));

  const statCards = [
    {
      id: 'total',
      label: 'Gesamte Einträge',
      value: totalEntries,
      icon: Calendar,
      color: 'bg-stone-100 text-stone-600',
    },
    {
      id: 'avg',
      label: 'Durchschnittliche Stimmung',
      value: MOOD_LABELS[averageMood as Mood] || 'N/A',
      icon: Smile,
      color: 'bg-stone-100 text-stone-600',
      emoji: MOOD_EMOJIS[averageMood as Mood],
    },
    {
      id: 'trend',
      label: 'Häufigste Stimmung',
      value: mostFrequentMood ? MOOD_LABELS[Number(mostFrequentMood[0]) as Mood] : 'N/A',
      icon: TrendingUp,
      color: 'bg-stone-100 text-stone-600',
      emoji: mostFrequentMood ? MOOD_EMOJIS[Number(mostFrequentMood[0]) as Mood] : null,
    },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statCards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 border border-stone-100 shadow-sm flex flex-col items-center text-center"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${card.color}`}>
              <card.icon size={28} />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
              {card.label}
            </p>
            <div className="flex items-center gap-2">
              {card.emoji && <span className="text-2xl">{card.emoji}</span>}
              <h4 className="font-serif text-2xl font-medium text-stone-800 tracking-tight">
                {card.value}
              </h4>
            </div>
          </motion.div>
        ))}
      </div>

      <MoodTrendChart entries={entries} days={14} />

      <MoodCalendar entries={entries} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[40px] p-10 border border-stone-100 shadow-sm">
          <h3 className="font-serif text-2xl font-medium text-stone-800 mb-8 tracking-tight">
            Stimmungsverteilung
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 10 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 10 }} />
                <RechartsTooltip
                  cursor={{ fill: '#f5f5f0' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-2xl shadow-lg border border-stone-100 text-xs">
                          <p className="font-semibold text-stone-800">{payload[0].payload.name}</p>
                          <p className="text-stone-500">{payload[0].value} Einträge</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.mood as Mood]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-10 border border-stone-100 shadow-sm">
          <h3 className="font-serif text-2xl font-medium text-stone-800 mb-8 tracking-tight">
            Top Themen (Tags)
          </h3>
          {topTags.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topTags}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topTags.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#5A5A40', '#8E9299', '#D1D1D1', '#A8A29E', '#E5E5E5'][index % 5]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-2xl shadow-lg border border-stone-100 text-xs">
                            <p className="font-semibold text-stone-800">{payload[0].name}</p>
                            <p className="text-stone-500">{payload[0].value} Verwendungen</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {topTags.map((tag, index) => (
                  <div key={tag.name} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: ['#5A5A40', '#8E9299', '#D1D1D1', '#A8A29E', '#E5E5E5'][
                          index % 5
                        ],
                      }}
                    />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                      {tag.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-stone-300 italic text-sm">
              Noch keine Tags vorhanden
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
