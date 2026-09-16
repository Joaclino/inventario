'use client';

import { useState, useEffect } from 'react';
import { getLocations, saveLocation } from '@/lib/storage';
import { LocationItem } from '@/types/inventory';
import { MapPin, Plus } from 'lucide-react';

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    setLocations(getLocations());
  }, []);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!building || !room) return;

    saveLocation({
      building,
      floor,
      room,
      description: desc
    });

    setBuilding('');
    setFloor('');
    setRoom('');
    setDesc('');
    setLocations(getLocations());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Gestão de Localizações</h1>
          <p className="text-xs text-slate-400">Cadastrar edifícios, pisos, salas, armazéns e frotas</p>
        </div>
      </div>

      {/* Formulário Nova Localização */}
      <form onSubmit={handleAddLocation} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Registar Nova Localização</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Edifício / Instalação *</label>
            <input
              type="text"
              placeholder="Ex: Edifício Principal, Bloco B..."
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Piso / Divisão</label>
            <input
              type="text"
              placeholder="Ex: Piso 1, Exterior..."
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Sala / Compartimento *</label>
            <input
              type="text"
              placeholder="Ex: Sala Financeira, Quarto 3..."
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Localização</span>
        </button>
      </form>

      {/* Lista de Localizações */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4">Localizações Cadastradas ({locations.length})</h2>
        <div className="space-y-2">
          {locations.map(loc => (
            <div key={loc.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-bold text-white">{loc.full_name}</span>
              </div>
              <span className="text-slate-500">{loc.description || 'Ativo'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
