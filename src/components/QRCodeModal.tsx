'use client';

import { useEffect, useState } from 'react';
import { Asset } from '@/types/inventory';
import { generateQRCodeDataUrl } from '@/lib/qrcode';
import { QrCode, Printer, X, Download, ShieldCheck, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  asset: Asset | null;
  onClose: () => void;
}

export default function QRCodeModal({ asset, onClose }: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (asset) {
      const assetUrl = `${window.location.origin}/asset/${asset.asset_code}`;
      generateQRCodeDataUrl(assetUrl).then(url => setQrCodeDataUrl(url));
    }
  }, [asset]);

  if (!asset) return null;

  const assetUrl = typeof window !== 'undefined' ? `${window.location.origin}/asset/${asset.asset_code}` : `/asset/${asset.asset_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(assetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Etiqueta Patrimonial com QR Code</h2>
          <p className="text-xs text-slate-400 mt-1">Digitalização rápida para telemóveis e leitores</p>
        </div>

        {/* ETIQUETA IMPRIMÍVEL DE DEMONSTRAÇÃO E QR */}
        <div id="printable-label" className="bg-white text-slate-900 p-5 rounded-2xl border-2 border-slate-300 shadow-inner text-center mb-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
            <div className="text-left">
              <span className="font-extrabold text-sm tracking-widest text-slate-900 block leading-none">INVENTÁRIO GERAL</span>
              <span className="text-[9px] font-bold text-slate-600 uppercase">Património Org.</span>
            </div>
            <span className="font-mono font-black text-sm bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
              {asset.asset_code}
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt={`QR Code ${asset.asset_code}`} className="w-40 h-40 object-contain mx-auto" />
            ) : (
              <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                Gerando QR...
              </div>
            )}
          </div>

          <div className="text-center mt-2">
            <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">{asset.description}</h3>
            <p className="text-xs text-slate-600 font-medium">{asset.category_name} {asset.subcategory_name ? `• ${asset.subcategory_name}` : ''}</p>
            {asset.serial_number && (
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">S/N: {asset.serial_number}</p>
            )}
          </div>
        </div>

        {/* URL do Ativo */}
        <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mb-6">
          <span className="text-slate-400 truncate flex-1 font-mono">{assetUrl}</span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center space-x-1 transition-colors flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePrintLabel}
            className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Etiqueta</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center"
          >
            <span>Fechar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
