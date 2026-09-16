'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getDepartments,
  getCategories,
  getLocations,
  getAssetStates,
  saveAsset,
  generateNextAssetCode
} from '@/lib/storage';
import { Department, Category, LocationItem, AssetState, AssetPhoto } from '@/types/inventory';
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Image as ImageIcon,
  Check,
  Package,
  MapPin,
  User,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Trash2
} from 'lucide-react';

export default function NewAssetWizardPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;

  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState<Department | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [states, setStates] = useState<AssetState[]>([]);

  // Campos do Formulário
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [isQuantityControlled, setIsQuantityControlled] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('un');

  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [locationName, setLocationName] = useState('');

  const [responsibleName, setResponsibleName] = useState('');

  const [stateName, setStateName] = useState('Bom');
  const [situation, setSituation] = useState('Em uso');

  const [photos, setPhotos] = useState<AssetPhoto[]>([]);
  const [acquisitionValue, setAcquisitionValue] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const depts = getDepartments();
    const dept = depts.find(d => d.id === departmentId);
    if (dept) {
      setDepartment(dept);
      setResponsibleName(dept.responsible_name || '');
    }

    const cats = getCategories();
    setCategories(cats);
    if (cats.length > 0) {
      setCategoryId(cats[0].id);
      setCategoryName(cats[0].name);
    }

    const locs = getLocations();
    setLocations(locs);
    if (locs.length > 0) {
      setBuilding(locs[0].building);
      setRoom(locs[0].room);
      setLocationName(locs[0].full_name);
    }

    const sts = getAssetStates();
    setStates(sts);
  }, [departmentId]);

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const selected = categories.find(c => c.id === catId);
    if (selected) {
      setCategoryName(selected.name);
      setSubcategoryName('');
    }
  };

  const handleLocationChange = (locId: string) => {
    const selected = locations.find(l => l.id === locId);
    if (selected) {
      setBuilding(selected.building);
      setRoom(selected.room);
      setLocationName(selected.full_name);
    }
  };

  // Leitura de foto pela câmara ou galeria do telemóvel
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, photoType: 'asset' | 'label' | 'serial') => {
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
            photo_type: photoType,
            caption: photoType === 'label' ? 'Etiqueta Patrimonial' : photoType === 'serial' ? 'Nº de Série' : 'Fotografia do Bem'
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

  const handleSave = () => {
    if (!department) return;

    const catCode = categories.find(c => c.id === categoryId)?.code || 'GEN';
    const code = generateNextAssetCode(catCode, isQuantityControlled);

    saveAsset({
      department_id: departmentId,
      asset_code: code,
      category_id: categoryId,
      category_name: categoryName,
      subcategory_name: subcategoryName,
      description,
      brand,
      model,
      serial_number: serialNumber,
      is_quantity_controlled: isQuantityControlled,
      quantity: isQuantityControlled ? Number(quantity) : 1,
      unit,
      building,
      room,
      location_name: locationName || `${building} -> ${room}`,
      responsible_name: responsibleName || department.responsible_name,
      state_name: stateName,
      situation,
      acquisition_value: acquisitionValue ? Number(acquisitionValue) : undefined,
      notes,
      photos
    });

    router.push(`/inventory/${departmentId}`);
  };

  const currentCategory = categories.find(c => c.id === categoryId);

  return (
    <div className="max-w-xl mx-auto py-4 px-2 sm:px-4 animate-fade-in pb-16">
      {/* Indicador de Passos Mobile */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-6 shadow-xl">
        <div className="flex items-center justify-between text-xs mb-3">
          <button
            type="button"
            onClick={() => router.push(`/inventory/${departmentId}`)}
            className="text-slate-400 hover:text-white flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-0.5" /> Cancelar
          </button>
          <span className="font-extrabold text-blue-400 uppercase tracking-widest text-[11px]">
            Passo {step} de 6
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* PAINEL DO PASSO ATUAL */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* PASSO 1 — O QUE É? */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">1. O que é o bem?</h2>
                <p className="text-xs text-slate-400">Classificação e descrição do objeto</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Categoria *</label>
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {currentCategory?.subcategories && currentCategory.subcategories.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Subcategoria</label>
                <select
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione a subcategoria...</option>
                  {currentCategory.subcategories.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Descrição do Bem *</label>
              <input
                type="text"
                placeholder="Ex: Laptop HP EliteBook, Pratos de Cerâmica, Mesa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Marca</label>
                <input
                  type="text"
                  placeholder="Ex: HP, Lenovo..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Modelo</label>
                <input
                  type="text"
                  placeholder="Ex: EliteBook 840"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Número de Série (se aplicável)</label>
              <input
                type="text"
                placeholder="Ex: 5CG1234XYZ"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Alternador de Controlo por Quantidade vs Unitário */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isQuantityControlled}
                  onChange={(e) => setIsQuantityControlled(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded bg-slate-950 border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-200">
                  Bem inventariado em QUANTIDADE (Lote de pratos, copos, etc.)
                </span>
              </label>

              {isQuantityControlled && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Quantidade</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Unidade</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="un">un (Unidades)</option>
                      <option value="cx">cx (Caixas)</option>
                      <option value="jogo">jogo (Conjunto)</option>
                      <option value="par">par (Pares)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASSO 2 — ONDE ESTÁ? */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">2. Onde está localizado?</h2>
                <p className="text-xs text-slate-400">Edifício, divisão e sala física</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Escolher Localização Registada</label>
              <select
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.full_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Edifício / Casa *</label>
                <input
                  type="text"
                  placeholder="Ex: Edifício Principal, Casa 2..."
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Sala / Divisão *</label>
                <input
                  type="text"
                  placeholder="Ex: Quarto 3, Cozinha..."
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* PASSO 3 — QUEM É RESPONSÁVEL? */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">3. Quem é o responsável?</h2>
                <p className="text-xs text-slate-400">Pessoa encarregue da guarda do bem</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Nome do Responsável pelo Bem *</label>
              <input
                type="text"
                placeholder="Ex: João Pereira, Maria Fernandes..."
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
        )}

        {/* PASSO 4 — QUAL É O ESTADO? */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">4. Qual é o estado do bem?</h2>
                <p className="text-xs text-slate-400">Conservação e situação de utilização</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Estado de Conservação *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {states.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStateName(s.name)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      stateName === s.name
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Situação Atual</label>
              <select
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Em uso">Em uso</option>
                <option value="Em armazenamento">Em armazenamento</option>
                <option value="Em manutenção">Em manutenção</option>
                <option value="Em empréstimo">Em empréstimo</option>
                <option value="Sem uso">Sem uso</option>
                <option value="Danificado">Danificado</option>
                <option value="Perdido">Perdido</option>
                <option value="Abatido">Abatido</option>
              </select>
            </div>
          </div>
        )}

        {/* PASSO 5 — FOTOGRAFIAS */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">5. Fotografias do Bem</h2>
                <p className="text-xs text-slate-400">Capturar imagem do bem, etiqueta ou nº de série</p>
              </div>
            </div>

            {/* Botões Grandes para Telemóvel */}
            <div className="grid grid-cols-2 gap-3">
              <label className="py-4 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs cursor-pointer flex flex-col items-center justify-center text-center shadow-lg shadow-blue-600/20 transition-all">
                <Camera className="w-6 h-6 mb-1" />
                <span>📷 TIRAR FOTO</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, 'asset')}
                />
              </label>

              <label className="py-4 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-2xl text-xs cursor-pointer flex flex-col items-center justify-center text-center transition-all">
                <ImageIcon className="w-6 h-6 mb-1 text-cyan-400" />
                <span>🖼️ ESCOLHER FOTO</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, 'asset')}
                />
              </label>
            </div>

            {/* Pré-visualização de fotos adicionadas */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-3">
                {photos.map(p => (
                  <div key={p.id} className="relative rounded-xl overflow-hidden border border-slate-700 h-24 bg-slate-950 group">
                    <img src={p.photo_url} alt="Foto bem" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(p.id)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-xs shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-bold text-center text-white truncate p-0.5">
                      {p.caption}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASSO 6 — REVER E GUARDAR */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">6. Confirmar e Guardar</h2>
                <p className="text-xs text-slate-400">Verifique os dados antes de finalizar</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Descrição:</span>
                <span className="font-bold text-white text-right">{description || 'Sem descrição'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Categoria:</span>
                <span className="font-bold text-blue-400">{categoryName} {subcategoryName ? `• ${subcategoryName}` : ''}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Localização:</span>
                <span className="font-bold text-emerald-400">{building} -&gt; {room}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Responsável:</span>
                <span className="font-bold text-white">{responsibleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado:</span>
                <span className="font-bold text-amber-400">{stateName} ({situation})</span>
              </div>
            </div>

            {/* Valor de Aquisição opcional */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Valor de Aquisição (Opcional - Kz)</label>
              <input
                type="number"
                placeholder="Ex: 850000"
                value={acquisitionValue}
                onChange={(e) => setAcquisitionValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* CONTROLO DE NAVEGAÇÃO ENTRE PASSOS */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition-all flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : <div></div>}

          {step < 6 ? (
            <button
              type="button"
              disabled={step === 1 && !description}
              onClick={() => setStep(s => s + 1)}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs transition-all flex items-center space-x-1 shadow-lg shadow-blue-600/30"
            >
              <span>Seguinte</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="py-3.5 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-sm transition-all shadow-xl shadow-emerald-600/40 flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>[ GUARDAR BEM ]</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
