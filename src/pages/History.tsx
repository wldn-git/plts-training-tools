import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Zap, TrendingUp, Battery, Ruler, Layout,
  FileText, Wrench, Search, Trash2, Clock,
  ChevronDown, ChevronUp, Check
} from 'lucide-react';

const TOOL_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  STRING_CONFIG:  { label: 'String Config',  icon: Zap,       color: 'text-blue-600',   bg: 'bg-blue-50'   },
  ROI:            { label: 'Kalkulator ROI', icon: TrendingUp, color: 'text-green-600',  bg: 'bg-green-50'  },
  BATTERY:        { label: 'Sizing Baterai', icon: Battery,   color: 'text-amber-600',  bg: 'bg-amber-50'  },
  CABLE_SIZING:   { label: 'Ukuran Kabel',  icon: Ruler,     color: 'text-red-600',    bg: 'bg-red-50'    },
  MOUNTING:       { label: 'Layout Mounting',icon: Layout,    color: 'text-indigo-600', bg: 'bg-indigo-50' },
  LOAD_PROFILE:   { label: 'Profil Beban',  icon: FileText,  color: 'text-orange-600', bg: 'bg-orange-50' },
  TROUBLESHOOTING:{ label: 'Troubleshooting',icon: Wrench,   color: 'text-pink-600',   bg: 'bg-pink-50'   },
};

export function History() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const calculations = useLiveQuery(() =>
    db.calculations.orderBy('createdAt').reverse().toArray()
  );

  const filtered = calculations?.filter(c => {
    const meta = TOOL_META[c.toolType];
    const label = meta?.label ?? c.toolType;
    const name = c.savedName ?? '';
    return (
      label.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirmDeleteId === id) {
      try {
        await db.calculations.delete(id);
        setConfirmDeleteId(null);
      } catch (error) {
        console.error("Failed to delete calculation:", error);
      }
    } else {
      setConfirmDeleteId(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Kalkulasi</h1>
          <p className="text-gray-600">Semua hasil kalkulasi yang pernah kamu simpan.</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filtered?.length ?? 0} riwayat
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari berdasarkan jenis alat atau nama..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {filtered === undefined ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat riwayat...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-10 w-10 text-gray-200" />
          </div>
          <div>
            <p className="text-gray-500 font-medium">Belum ada riwayat kalkulasi.</p>
            <p className="text-xs text-gray-400 mt-1">
              Gunakan kalkulator lalu klik "Simpan" untuk menyimpan hasil ke sini.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((calc) => {
            const meta = TOOL_META[calc.toolType] ?? {
              label: calc.toolType,
              icon: FileText,
              color: 'text-gray-600',
              bg: 'bg-gray-50'
            };
            const Icon = meta.icon;
            const isExpanded = expandedId === calc.id;

            return (
              <Card key={calc.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`${meta.bg} p-2.5 rounded-xl shrink-0`}>
                        <Icon className={`h-5 w-5 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px]">
                            {meta.label}
                          </Badge>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(calc.createdAt)}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800 mt-1 truncate">
                          {calc.savedName ?? `Kalkulasi ${meta.label}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {Object.entries(calc.inputs || {}).slice(0, 3).map(([k, v]) => (
                            `${k}: ${v}`
                          )).join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExpandedId(isExpanded ? null : calc.id!)}
                      >
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 transition-all ${
                          confirmDeleteId === calc.id 
                            ? 'text-white bg-red-600 hover:bg-red-700 rounded-lg' 
                            : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        onClick={(e) => handleDelete(e, calc.id!)}
                      >
                        {confirmDeleteId === calc.id 
                          ? <Check className="h-4 w-4" /> 
                          : <Trash2 className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Output Detail */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Detail Hasil:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(calc.outputs || {})
                          .filter(([, v]) => typeof v !== 'object')
                          .slice(0, 9)
                          .map(([k, v]) => (
                            <div key={k} className="bg-gray-50 p-2 rounded-lg">
                              <p className="text-[9px] text-gray-400 uppercase font-bold truncate">{k}</p>
                              <p className="text-sm font-bold text-gray-800 truncate">{String(v)}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
