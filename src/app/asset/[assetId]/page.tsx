'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAssetById, getDepartments } from '@/lib/storage';
import { Asset, Department } from '@/types/inventory';
import PhysicalCheckBadge from '@/components/PhysicalCheckBadge';
import QRCodeModal from '@/components/QRCodeModal';
import { formatCurrencyKz } from '@/lib/export/excel';
import {
  QrCode,
  Printer,
  ChevronLeft,
  Building2,
  MapPin,
  User,
  Hash,
  Layers,
  Camera,
  Tag,
  ShieldCheck,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.assetId as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    const found = getAssetById(assetId);
    if (found) {
      setAsset(found);
      const depts = getDepartments();
      const d = depts.find(dept => dept.id === found.department_id);
      if (d) setDepartment(d);
    }
  }, [assetId]);

  if (!asset) {
    return (
      <div className="max-w-md mx-auto py-12 text-center text-slate-400">
        <Hash className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Bem não encontrado</h2>
        <p className="text-xs text-slate-400 mb-4">O código patrimonial "{assetId}" não existe ou foi removido.</p>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Voltar ao Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Navegação Back */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white text-xs font-semibold flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar ao Inventário
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setQrModalOpen(true)}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/20"
          >
            <QrCode className="w-4 h-4" />
            <span>[ GERAR QR CODE ]</span>
          </button>

          <button
            onClick={() => window.print()}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>[ IMPRIMIR ETIQUETA ]</span>
          </button>
        </div>
      </div>

      {/* Cartão de Ficha Completa do Bem */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-mono text-base font-extrabold text-blue-400 bg-blue-950/80 px-3 py-1 rounded-xl border border-blue-500/40">
                {asset.asset_code}
              </span>

              {asset.is_quantity_controlled && (
                <span className="bg-purple-950/80 text-purple-300 border border-purple-500/40 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Qtd: {asset.quantity} {asset.unit}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-white leading-tight mb-1">{asset.description}</h1>
            <p className="text-xs text-slate-400">
              {asset.category_name} {asset.subcategory_name ? `• ${asset.subcategory_name}` : ''}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {asset.state_name} ({asset.situation})
            </span>
          </div>
        </div>

        {/* Fotografias do Bem */}
        {asset.photos && asset.photos.length > 0 ? (
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block mb-3">Fotografias Registadas</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {asset.photos.map(p => (
                <div key={p.id} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-48 relative group">
                  <img src={p.photo_url} alt={p.caption || 'Foto bem'} className="w-full h-full object-cover" />
                  {p.caption && (
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-white text-[10px] font-bold p-1.5 text-center">
                      {p.caption}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-slate-500">
            <Camera className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs">Sem fotografias registadas para este bem.</p>
          </div>
        )}

        {/* Grelha de Detalhes Técnicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] block border-b border-slate-800 pb-1">
              Identificação & Especificações
            </span>
            <div className="flex justify-between"><span className="text-slate-500">Marca:</span><span className="font-bold text-white">{asset.brand || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Modelo:</span><span className="font-bold text-white">{asset.model || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Nº de Série:</span><span className="font-mono font-bold text-blue-400">{asset.serial_number || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">ID Interno / Existente:</span><span className="font-mono text-slate-300">{asset.existing_id || asset.internal_id || '-'}</span></div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] block border-b border-slate-800 pb-1">
              Responsabilidade & Localização
            </span>
            <div className="flex justify-between"><span className="text-slate-500">Departamento:</span><span className="font-bold text-white">{department?.name || 'Não atribuído'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Responsável:</span><span className="font-bold text-white">{asset.responsible_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Edifício / Casa:</span><span className="font-bold text-emerald-400">{asset.building || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Sala:</span><span className="font-bold text-emerald-400">{asset.room || '-'}</span></div>
          </div>
        </div>

        {/* Valores Financeiros */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Valor de Aquisição</span>
            <span className="text-lg font-extrabold text-blue-400">{formatCurrencyKz(asset.acquisition_value)}</span>
          </div>

          <div>
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Valor Estimado Atual</span>
            <span className="text-lg font-extrabold text-cyan-400">{formatCurrencyKz(asset.estimated_current_value)}</span>
          </div>
        </div>

        {/* Conferência Física (Confirmar Presença) */}
        <div>
          <PhysicalCheckBadge
            assetId={asset.id}
            initialStatus={asset.physical_check_status}
            confirmedBy={asset.responsible_name}
          />
        </div>
      </div>

      {/* Modal QR Code */}
      <QRCodeModal asset={qrModalOpen ? asset : null} onClose={() => setQrModalOpen(false)} />
    </div>
  );
}
