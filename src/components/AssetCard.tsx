'use client';

import { Asset } from '@/types/inventory';
import PhysicalCheckBadge from './PhysicalCheckBadge';
import Link from 'next/link';
import {
  QrCode,
  MapPin,
  User,
  Hash,
  Layers,
  Camera,
  Eye
} from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  onOpenQR?: (asset: Asset) => void;
}

export default function AssetCard({ asset, onOpenQR }: AssetCardProps) {
  const photoUrl = asset.photos && asset.photos.length > 0 ? asset.photos[0].photo_url : null;

  return (
    <div className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-twftw-navy rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-xs tracking-wider text-twftw-navy bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center space-x-1">
              <Hash className="w-3.5 h-3.5 text-amber-600" />
              <span>{asset.asset_code}</span>
            </span>

            {asset.is_quantity_controlled && (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>Qtd: {asset.quantity} {asset.unit}</span>
              </span>
            )}
          </div>

          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800">
            {asset.state_name}
          </span>
        </div>

        <div className="flex gap-3 items-start mb-3">
          <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden relative flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={asset.description}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                <Camera className="w-5 h-5 text-slate-400 mb-0.5" />
                <span className="text-[8px] uppercase font-bold text-slate-400">Sem Foto</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 mb-1 group-hover:text-twftw-navy transition-colors">
              {asset.description}
            </h3>

            <div className="text-xs text-slate-500 font-medium truncate">
              {asset.location_name}
            </div>
          </div>
        </div>

        {/* Conferência Física */}
        <PhysicalCheckBadge
          assetId={asset.id}
          initialStatus={asset.physical_check_status}
          confirmedBy={asset.responsible_name}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/asset/${asset.asset_code}`}
          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-twftw-navy hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver Ficha</span>
        </Link>

        {onOpenQR && (
          <button
            type="button"
            onClick={() => onOpenQR(asset)}
            className="py-2 px-3 bg-white hover:bg-slate-100 text-twftw-navy border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
        )}
      </div>
    </div>
  );
}
