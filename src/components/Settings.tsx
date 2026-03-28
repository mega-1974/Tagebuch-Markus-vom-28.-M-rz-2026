/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Shield, Database, Cloud, Download, Trash2, Info } from 'lucide-react';

interface SettingsProps {
  user: UserProfile;
  onExportData: (format: 'json' | 'pdf') => void;
  onClearLocalData: () => void;
  isBackupEnabled: boolean;
  onToggleBackup: (enabled: boolean) => void;
  lastBackupTime: string | null;
  isCloudConnected: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ 
  user, 
  onExportData, 
  onClearLocalData,
  isBackupEnabled,
  onToggleBackup,
  lastBackupTime,
  isCloudConnected
}) => {
  const settingsSections: {
    id: string;
    title: string;
    icon: any;
    items: {
      label: string;
      description: string;
      status?: string;
      statusColor?: string;
      icon: any;
      action?: () => void;
      actionLabel?: string;
      danger?: boolean;
      toggle?: boolean;
    }[];
  }[] = [
    {
      id: 'privacy',
      title: 'Privatsphäre & Sicherheit',
      icon: Shield,
      items: [
        {
          label: 'Cloud-Synchronisierung',
          description: 'Deine Daten werden sicher in der Google Cloud verschlüsselt gespeichert.',
          status: isCloudConnected ? 'Verbunden' : 'Verbindung gestört',
          statusColor: isCloudConnected ? 'green' : 'red',
          icon: Cloud,
        },
        {
          label: 'Lokale Sicherung',
          description: lastBackupTime 
            ? `Zuletzt gesichert am: ${new Date(lastBackupTime).toLocaleString('de-DE')}`
            : 'Keine Sicherung vorhanden.',
          status: isBackupEnabled ? 'Aktiviert' : 'Deaktiviert',
          statusColor: isBackupEnabled ? 'green' : 'amber',
          icon: Database,
          toggle: true,
        },
      ],
    },
    {
      id: 'data',
      title: 'Datenverwaltung',
      icon: Database,
      items: [
        {
          label: 'Daten exportieren (JSON)',
          description: 'Lade alle deine Tagebucheinträge als JSON-Datei herunter.',
          action: () => onExportData('json'),
          actionLabel: 'JSON Export',
          icon: Download,
        },
        {
          label: 'Daten exportieren (PDF)',
          description: 'Lade deine Einträge als schön formatierte PDF-Datei herunter.',
          action: () => onExportData('pdf'),
          actionLabel: 'PDF Export',
          icon: Download,
        },
        {
          label: 'Lokalen Cache leeren',
          description: 'Löscht nur die lokale Kopie deiner Daten. Cloud-Daten bleiben erhalten.',
          action: onClearLocalData,
          actionLabel: 'Leeren',
          icon: Trash2,
          danger: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-12">
      <div className="bg-white rounded-[40px] p-10 border border-blue-100 shadow-xl shadow-blue-900/5">
        <div className="flex items-center gap-6 mb-10">
          <img
            src={user.photoURL}
            alt={user.displayName}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-[32px] object-cover border-4 border-blue-50 shadow-md"
          />
          <div>
            <h3 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
              {user.displayName}
            </h3>
            <p className="text-slate-400 text-sm font-medium">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {settingsSections.map((section) => (
            <div key={section.id} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                  <section.icon size={20} />
                </div>
                <h4 className="font-serif text-xl font-bold text-slate-900 tracking-tight">
                  {section.title}
                </h4>
              </div>

              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4 hover:border-blue-100 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-primary border border-blue-50 shadow-sm">
                        <item.icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 mb-1">{item.label}</p>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {item.status && (
                      <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full w-fit border ${
                        item.statusColor === 'amber' 
                          ? 'text-amber-500 bg-amber-50 border-amber-100' 
                          : item.statusColor === 'green'
                            ? 'text-green-600 bg-green-50 border-green-100'
                            : item.statusColor === 'red'
                              ? 'text-red-600 bg-red-50 border-red-100'
                              : 'text-blue-600 bg-blue-50 border-blue-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          item.statusColor === 'amber' 
                            ? 'bg-amber-500' 
                            : item.statusColor === 'green'
                              ? 'bg-green-500'
                              : item.statusColor === 'red'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                        }`} />
                        {item.status}
                      </div>
                    )}

                    {item.toggle && (
                      <button
                        onClick={() => onToggleBackup(!isBackupEnabled)}
                        className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                          isBackupEnabled
                            ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                            : 'metallic-gloss text-white shadow-lg shadow-blue-100'
                        }`}
                      >
                        {isBackupEnabled ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                    )}

                    {item.action && !item.toggle && (
                      <button
                        onClick={item.action}
                        className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                          item.danger
                            ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                            : 'metallic-gloss text-white shadow-lg shadow-blue-100'
                        }`}
                      >
                        {item.actionLabel}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="metallic-gloss rounded-[40px] p-10 text-white flex items-center gap-8 shadow-2xl shadow-blue-200">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
          <Info size={32} />
        </div>
        <div>
          <h4 className="font-serif text-2xl font-bold mb-2 tracking-tight">Über Mindful Path</h4>
          <p className="text-white/80 text-sm font-medium leading-relaxed max-w-lg">
            Diese App wurde entwickelt, um dich auf deinem Weg zu unterstützen. 
            Deine Daten gehören dir und sind jederzeit sicher verschlüsselt. 
            Denke daran: Du bist nicht allein.
          </p>
        </div>
      </div>
    </div>
  );
};
