'use client';

import { useState } from 'react';
import { PhysicalCheckStatus } from '@/types/inventory';
import { updatePhysicalCheckStatus } from '@/lib/storage';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface PhysicalCheckBadgeProps {
  assetId: string;
  initialStatus: PhysicalCheckStatus;
  confirmedBy?: string;
  onStatusChange?: (newStatus: PhysicalCheckStatus) => void;
  compact?: boolean;
}

export default function PhysicalCheckBadge({
  assetId,
  initialStatus,
  confirmedBy,
  onStatusChange,
  compact = false
}: PhysicalCheckBadgeProps) {
  const [status, setStatus] = useState<PhysicalCheckStatus>(initialStatus || 'found');

  const handleUpdate = (newStatus: PhysicalCheckStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus(newStatus);
    updatePhysicalCheckStatus(assetId, newStatus, confirmedBy || 'Utilizador Atual');
    if (onStatusChange) onStatusChange(newStatus);
  };

  if (compact) {
    return (
      <div className="inline-flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
        {status === 'found' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Encontrado
          </span>
        )}
        {status === 'not_found' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Não Encontrado
          </span>
        )}
        {status === 'needs_verification' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Verificar
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60" onClick={(e) => e.stopPropagation()}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
        Conferência Física do Bem:
      </span>
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={(e) => handleUpdate('found', e)}
          className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
            status === 'found'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'bg-slate-700/60 text-slate-300 hover:bg-emerald-950/40 hover:text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Encontrado</span>
        </button>

        <button
          type="button"
          onClick={(e) => handleUpdate('not_found', e)}
          className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
            status === 'not_found'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400'
              : 'bg-slate-700/60 text-slate-300 hover:bg-red-950/40 hover:text-red-300'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Ausente</span>
        </button>

        <button
          type="button"
          onClick={(e) => handleUpdate('needs_verification', e)}
          className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
            status === 'needs_verification'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400'
              : 'bg-slate-700/60 text-slate-300 hover:bg-amber-950/40 hover:text-amber-300'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Verificar</span>
        </button>
      </div>
    </div>
  );
}
