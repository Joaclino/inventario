'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Asset } from '@/types/inventory';
import PhysicalCheckBadge from './PhysicalCheckBadge';
import {
  QrCode,
  MapPin,
  User,
  Box,
  Hash,
  Tag,
  Eye,
  Camera,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  onOpenQR?: (asset: Asset) => void;
  onEdit?: (asset: Asset) => void;
}

export default function AssetCard({ asset, onOpenQR, onEdit }: AssetCardProps) {
  const photoUrl = asset.photos && asset.photos.length > 0 ? asset.photos[0].photo_url : null;

  // Obter cor para badge de estado
  const getStateColor = (stateName: string) => {
    const s = stateName.toLowerCase();
    if (s.includes('novo') || s.includes('excelente')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (s.includes('bom')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (s.includes('regular')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    if (s.includes('mau') || s.includes('danificado')) return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    if (s.includes('inutilizável') || s.includes('perdido')) return 'bg-red-500/10 text-red-400 border-red-500/30';
    return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
  };

  return (
    <div className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-4 transition-all duration-200 shadow-lg flex flex-col justify-between group">
      <div>
        {/* Cabeçalho do Card: Código Patrimonial & Categoria */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-sm tracking-wider text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-500/30 flex items-center space-x-1">
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              <span>{asset.asset_code}</span>
            </span>

            {asset.is_quantity_controlled && (
              <span className="bg-purple-950/60 text-purple-300 border border-purple-500/30 text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>Qtd: {asset.quantity} {asset.unit}</span>
              </span>
            )}
          </div>

          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStateColor(asset.state_name)}`}>
            {asset.state_name}
          </span>
        </div>

        {/* Imagem + Detalhes Principais */}
        <div className="flex gap-3 items-start mb-3">
          <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-700/80 flex-shrink-0 overflow-hidden relative group-hover:border-blue-500/30 flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={asset.description}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                <Camera className="w-6 h-6 mb-1 text-slate-600" />
                <span className="text-[9px] uppercase font-bold text-slate-600">Sem Foto</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400 font-medium flex items-center space-x-1 mb-0.5">
              <span>{asset.category_name}</span>
              {asset.subcategory_name && (
                <>
                  <span>•</span>
                  <span className="text-slate-300 font-semibold">{asset.subcategory_name}</span>
                </>
              )}
            </div>

            <h3 className="font-bold text-white text-base leading-snug line-clamp-2 mb-1 group-hover:text-blue-300 transition-colors">
              {asset.description}
            </h3>

            {(asset.brand || asset.model) && (
              <div className="text-xs text-slate-400 font-mono">
                {asset.brand && <span className="font-semibold text-slate-300">{asset.brand} </span>}
                {asset.model && <span>{asset.model}</span>}
              </div>
            )}

            {asset.serial_number && (
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                S/N: <span className="text-slate-300">{asset.serial_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Metadados: Responsável e Localização */}
        <div className="space-y-1.5 py-2 border-t border-b border-slate-700/50 mb-3 text-xs">
          <div className="flex items-center text-slate-300 space-x-2 truncate">
            <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="text-slate-400">Resp:</span>
            <span className="font-medium text-white truncate">{asset.responsible_name}</span>
          </div>

          <div className="flex items-center text-slate-300 space-x-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-slate-400">Local:</span>
            <span className="font-medium text-white truncate">{asset.location_name}</span>
          </div>
        </div>

        {/* Conferência Física (Confirmar Presença) */}
        <PhysicalCheckBadge
          assetId={asset.id}
          initialStatus={asset.physical_check_status}
          confirmedBy={asset.responsible_name}
        />
      </div>

      {/* Ações Rápidas no Card */}
      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
        <Link
          href={`/asset/${asset.asset_code}`}
          className="flex-1 py-2 px-3 bg-slate-700/60 hover:bg-blue-600 hover:text-white text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ficha do Bem</span>
        </Link>

        {onOpenQR && (
          <button
            type="button"
            onClick={() => onOpenQR(asset)}
            className="py-2 px-3 bg-slate-700/60 hover:bg-slate-700 text-blue-400 border border-slate-600/50 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
            title="Gerar e Imprimir QR Code"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
        )}
      </div>
    </div>
  );
}
