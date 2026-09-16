'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getInventories,
  saveAsset,
  generateNextAssetCode
} from '@/lib/storage';
import { Inventory, AssetPhoto } from '@/types/inventory';
import {
  ChevronLeft,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Package,
  ArrowRight,
  ListFilter
} from 'lucide-react';

export default function NewAssetSimplePage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;

  const [inventory, setInventory] = useState<Inventory | null>(null);

  // Campos do Formulário
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [locationName, setLocationName] = useState('');
  const [stateName, setStateName] = useState('Bom');
  const [photos, setPhotos] = useState<AssetPhoto[]>([]);

  // Estado do Modal de Sucesso após Guardar
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSavedDescription, setLastSavedDescription] = useState('');
  const [lastSavedQty, setLastSavedQty] = useState(1);

  useEffect(() => {
    const invs = getInventories();
    const inv = invs.find(i => i.department_id === departmentId || i.id === departmentId);
    if (inv) setInventory(inv);
  }, [departmentId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: AssetPhoto = {
            id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            asset_id: '',
            photo_url: event.target.result as string,
            photo_type: 'asset',
            caption: 'Fotografia do Bem'
          };
          setPhotos(prev => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const code = generateNextAssetCode('GERAL', quantity > 1);

    saveAsset({
      department_id: departmentId,
      inventory_id: inventory?.id,
      asset_code: code,
      category_name: 'Geral',
      description: description.trim(),
      is_quantity_controlled: quantity > 1,
      quantity: Number(quantity),
      unit: 'un',
      location_name: locationName.trim() || 'Geral',
      building: locationName.trim() || 'Geral',
      room: locationName.trim() || 'Geral',
      responsible_name: inventory?.responsible_name || 'Terreno',
      state_name: stateName,
      situation: stateName === 'Estragado / Danificado' ? 'Danificado' : 'Em uso',
      photos
    });

    setLastSavedDescription(description.trim());
    setLastSavedQty(quantity);
    setShowSuccessModal(true);
  };

  const handleRegisterAnother = () => {
    setDescription('');
    setQuantity(1);
    setPhotos([]);
    setLocationName('');
    setShowSuccessModal(false);
  };

  const handleGoToInventory = () => {
    setShowSuccessModal(false);
    router.push(`/inventory/${departmentId}`);
  };

  return (
    <div className="max-w-xl mx-auto py-4 px-2 sm:px-4 animate-fade-in pb-16">
      {/* Botão de Voltar */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => router.push(`/inventory/${departmentId}`)}
          className="py-2 px-3.5 bg-white border border-slate-300 text-slate-700 hover:text-twftw-navy rounded-xl text-xs font-bold flex items-center shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar à Lista
        </button>

        <span className="text-xs font-extrabold text-twftw-navy bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Novo Item
        </span>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="text-center pb-3 border-b border-slate-100">
          <h1 className="text-xl font-black text-twftw-navy">Cadastrar Item no Inventário</h1>
          <p className="text-xs text-slate-500 mt-0.5">Preencha o nome do objeto. A foto é opcional!</p>
        </div>

        {/* 1. NOME DO OBJETO */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-twftw-navy mb-1.5">
            1. O que é este objeto? *
          </label>
          <input
            type="text"
            placeholder="Ex: Mesa de Madeira, Frigorífico, Cadeira, Pratos..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-base text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-twftw-navy shadow-sm"
            required
            autoFocus
          />
        </div>

        {/* 2. QUANTIDADE */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-twftw-navy">
            2. Quantidade
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-12 h-12 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xl flex items-center justify-center shadow-sm hover:bg-slate-100"
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="flex-1 bg-white border border-slate-300 rounded-xl py-3 text-center text-xl font-black text-twftw-navy focus:outline-none shadow-sm"
            />
            <button
              type="button"
              onClick={() => setQuantity(q => q + 1)}
              className="w-12 h-12 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xl flex items-center justify-center shadow-sm hover:bg-slate-100"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3. FOTOGRAFIA (OPCIONAL) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-twftw-navy">
              3. Tirar Fotografia
            </label>
            <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
              Opcional
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="py-3.5 px-3 bg-twftw-navy hover:bg-slate-800 text-white font-bold rounded-2xl text-xs cursor-pointer flex flex-col items-center justify-center text-center shadow transition-all active:scale-95">
              <Camera className="w-6 h-6 mb-1 text-amber-400" />
              <span>📷 TIRAR FOTO</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>

            <label className="py-3.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded-2xl text-xs cursor-pointer flex flex-col items-center justify-center text-center transition-all">
              <ImageIcon className="w-6 h-6 mb-1 text-blue-600" />
              <span>🖼️ GALERIA</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {photos.map(p => (
                <div key={p.id} className="relative rounded-2xl overflow-hidden border border-slate-200 h-20 bg-slate-100">
                  <img src={p.photo_url} alt="Foto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(p.id)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-xs shadow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. LOCALIZAÇÃO (OPCIONAL) */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-twftw-navy mb-1.5">
            4. Onde está localizado? (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Cozinha, Sala, Quarto 2..."
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-twftw-navy"
          />
        </div>

        {/* 5. ESTADO DE CONSERVAÇÃO */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-twftw-navy mb-2">
            5. Estado do objeto
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Novo', color: 'bg-emerald-600' },
              { label: 'Bom', color: 'bg-blue-600' },
              { label: 'Regular', color: 'bg-amber-600' },
              { label: 'Estragado / Danificado', color: 'bg-red-600' }
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => setStateName(item.label)}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                  stateName === item.label
                    ? `${item.color} text-white border-white ring-2 ring-slate-400`
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* BOTÃO GUARDAR */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={!description.trim()}
            className="w-full py-4 px-6 bg-twftw-navy hover:bg-slate-800 disabled:opacity-40 text-white font-black rounded-2xl text-sm transition-all shadow-md flex items-center justify-center space-x-2 transform active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <span>[ 🟢 GUARDAR ITEM ]</span>
          </button>
        </div>
      </form>

      {/* MODAL DE MENSAGEM DE SUCESSO BEM VISÍVEL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">Item Cadastrado com Sucesso!</h2>
              <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block text-left w-full">
                <p className="text-sm font-extrabold text-twftw-navy">{lastSavedDescription}</p>
                <p className="text-xs text-slate-500 font-semibold">Quantidade: {lastSavedQty} unidade(s)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-bold">O que pretende fazer agora?</p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleRegisterAnother}
                className="w-full py-4 px-5 bg-twftw-navy hover:bg-slate-800 text-white font-black rounded-2xl text-xs transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>[ ➕ CADASTRAR OUTRO ITEM ]</span>
              </button>

              <button
                type="button"
                onClick={handleGoToInventory}
                className="w-full py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 border border-slate-300"
              >
                <ListFilter className="w-4 h-4 text-blue-600" />
                <span>[ 📋 VER INVENTÁRIO / LISTA DE BENS ]</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
