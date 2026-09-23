import {
  Asset,
  Department,
  Category,
  LocationItem,
  AssetState,
  Inventory,
  AuditLog,
  UserProfile,
  PhysicalCheckStatus
} from '@/types/inventory';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
  INITIAL_LOCATIONS,
  INITIAL_STATES
} from './mockData';
import { createClient } from './supabase/client';

const KEYS = {
  DEPARTMENTS: 'inventario_departments_v4',
  CATEGORIES: 'inventario_categories_v4',
  LOCATIONS: 'inventario_locations_v4',
  STATES: 'inventario_states_v4',
  INVENTORIES: 'inventario_inventories_v4',
  ASSETS: 'inventario_assets_v4',
  AUDIT_LOGS: 'inventario_audit_logs_v4',
  USER_PROFILE: 'inventario_current_user_v4',
  ADMIN_AUTH: 'inventario_admin_authenticated_v4',
  FIELD_RESPONSIBLE_NAME: 'inventario_field_responsible_v4'
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Erro ao ler localStorage [${key}]:`, err);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Erro ao gravar localStorage [${key}]:`, err);
  }
}

export function initializeStorage(): void {
  if (!isBrowser()) return;
  if (!localStorage.getItem(KEYS.DEPARTMENTS)) setItem(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  if (!localStorage.getItem(KEYS.CATEGORIES)) setItem(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  if (!localStorage.getItem(KEYS.LOCATIONS)) setItem(KEYS.LOCATIONS, INITIAL_LOCATIONS);
  if (!localStorage.getItem(KEYS.STATES)) setItem(KEYS.STATES, INITIAL_STATES);
  if (!localStorage.getItem(KEYS.INVENTORIES)) setItem(KEYS.INVENTORIES, []);
  if (!localStorage.getItem(KEYS.ASSETS)) setItem(KEYS.ASSETS, []);
  if (!localStorage.getItem(KEYS.AUDIT_LOGS)) setItem(KEYS.AUDIT_LOGS, []);
}

export function clearAllStorageData(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.ASSETS);
  localStorage.removeItem(KEYS.INVENTORIES);
  localStorage.removeItem(KEYS.AUDIT_LOGS);
  setItem(KEYS.ASSETS, []);
  setItem(KEYS.INVENTORIES, []);
  setItem(KEYS.AUDIT_LOGS, []);
}

// -------------------------------------------------------------
// SINCRONIZAÇÃO EM TEMPO REAL COM O SUPABASE
// -------------------------------------------------------------
export async function syncWithSupabase(): Promise<{ inventories: Inventory[]; assets: Asset[] }> {
  if (!isBrowser()) return { inventories: getInventories(), assets: getAssets() };

  const supabase = createClient();
  if (!supabase) return { inventories: getInventories(), assets: getAssets() };

  try {
    // 1. Buscar inventários do Supabase
    const { data: remoteInventories, error: invError } = await supabase
      .from('inventories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!invError && remoteInventories) {
      const formattedInvs: Inventory[] = remoteInventories.map((i: any) => ({
        id: i.id,
        department_id: i.department_id || 'dept-geral',
        title: i.title,
        status: i.status || 'in_progress',
        start_date: i.start_date || new Date().toISOString().split('T')[0],
        end_date: i.end_date,
        responsible_name: i.responsible_name,
        general_notes: i.general_notes || '',
        responsible_signature: i.responsible_signature,
        admin_validation_signature: i.admin_validation_signature,
        validated_by: i.validated_by,
        validated_at: i.validated_at,
        created_at: i.created_at,
        updated_at: i.updated_at
      }));

      // Mesclar inventários remotos com locais
      const localInvs = getInventories();
      const invMap = new Map<string, Inventory>();

      localInvs.forEach(inv => invMap.set(inv.id, inv));
      formattedInvs.forEach(inv => invMap.set(inv.id, inv));

      const mergedInvs = Array.from(invMap.values());
      setItem(KEYS.INVENTORIES, mergedInvs);
    }

    // 2. Buscar bens/ativos do Supabase
    const { data: remoteAssets, error: astError } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!astError && remoteAssets) {
      const formattedAssets: Asset[] = remoteAssets.map((a: any) => ({
        id: a.id,
        inventory_id: a.inventory_id,
        department_id: a.department_id || 'dept-geral',
        asset_code: a.asset_code,
        internal_id: a.internal_id || a.asset_code,
        category_id: a.category_id,
        subcategory_id: a.subcategory_id,
        category_name: a.category_name || 'Geral',
        subcategory_name: a.subcategory_name || '',
        description: a.description,
        brand: a.brand || '',
        model: a.model || '',
        serial_number: a.serial_number || '',
        existing_id: a.existing_id || '',
        is_quantity_controlled: !!a.is_quantity_controlled,
        quantity: a.quantity || 1,
        unit: a.unit || 'un',
        responsible_name: a.responsible_name,
        location_id: a.location_id,
        location_name: a.location_name || 'Geral',
        room: a.room || '',
        building: a.building || '',
        state_id: a.state_id,
        state_name: a.state_name || 'Bom',
        situation: a.situation || 'Em uso',
        acquisition_value: a.acquisition_value,
        currency: a.currency || 'Kz',
        acquisition_date: a.acquisition_date,
        supplier: a.supplier,
        invoice_number: a.invoice_number,
        estimated_current_value: a.estimated_current_value,
        physical_check_status: a.physical_check_status || 'found',
        notes: a.notes || '',
        photos: a.photos || [],
        first_registered_at: a.first_registered_at,
        last_inventoried_at: a.last_inventoried_at,
        last_confirmed_by: a.last_confirmed_by,
        last_confirmed_state: a.last_confirmed_state,
        created_at: a.created_at,
        updated_at: a.updated_at
      }));

      const localAssets = getAssets();
      const astMap = new Map<string, Asset>();

      localAssets.forEach(ast => astMap.set(ast.id, ast));
      formattedAssets.forEach(ast => astMap.set(ast.id, ast));

      const mergedAssets = Array.from(astMap.values());
      setItem(KEYS.ASSETS, mergedAssets);
    }
  } catch (err) {
    console.error('Erro na sincronização com o Supabase:', err);
  }

  return {
    inventories: getInventories(),
    assets: getAssets()
  };
}

// -------------------------------------------------------------
// CADASTRO BÁSICO DO UTILIZADOR NO TERRENO
// -------------------------------------------------------------
export function getFieldResponsibleName(): string {
  if (!isBrowser()) return '';
  return getItem<string>(KEYS.FIELD_RESPONSIBLE_NAME, '');
}

export function setFieldResponsibleName(name: string): void {
  if (!isBrowser()) return;
  setItem(KEYS.FIELD_RESPONSIBLE_NAME, name.trim());
}

// -------------------------------------------------------------
// AUTENTICAÇÃO E SENHA DE ADMIN (JOACLINOP)
// -------------------------------------------------------------
export function isAdminAuthenticated(): boolean {
  if (!isBrowser()) return false;
  return getItem<boolean>(KEYS.ADMIN_AUTH, false);
}

export function authenticateAdmin(password: string): boolean {
  if (!isBrowser()) return false;
  const validPasswords = ['joaclinop123', 'admin123', 'admin', 'twftw123', '1234'];
  const isValid = validPasswords.includes(password.trim().toLowerCase());
  if (isValid) {
    setItem(KEYS.ADMIN_AUTH, true);
    setCurrentUser({
      id: 'usr-joaclinop',
      full_name: 'Joaclinop (Admin)',
      email: 'joaclinop@twftw.org',
      role: 'ADMIN'
    });
  }
  return isValid;
}

export function logoutAdmin(): void {
  if (!isBrowser()) return;
  setItem(KEYS.ADMIN_AUTH, false);
  const responsible = getFieldResponsibleName();
  setCurrentUser({
    id: `usr-field-${Date.now()}`,
    full_name: responsible || 'Utilizador do Terreno',
    email: 'terreno@twftw.org',
    role: 'DEPARTMENT_USER'
  });
}

export function getCurrentUser(): UserProfile | null {
  if (!isBrowser()) return null;
  const user = getItem<UserProfile | null>(KEYS.USER_PROFILE, null);
  if (user) return user;

  const responsible = getFieldResponsibleName();
  const defaultUser: UserProfile = {
    id: `usr-field-${Date.now()}`,
    full_name: responsible || 'Utilizador do Terreno',
    email: 'terreno@twftw.org',
    role: 'DEPARTMENT_USER'
  };
  setItem(KEYS.USER_PROFILE, defaultUser);
  return defaultUser;
}

export function isUserAdmin(user?: UserProfile | null): boolean {
  return isAdminAuthenticated();
}

export function setCurrentUser(user: UserProfile | null): void {
  if (!isBrowser()) return;
  if (user) {
    setItem(KEYS.USER_PROFILE, user);
  } else {
    localStorage.removeItem(KEYS.USER_PROFILE);
  }
}

// -------------------------------------------------------------
// DEPARTAMENTOS
// -------------------------------------------------------------
export function getDepartments(): Department[] {
  initializeStorage();
  return getItem(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
}

export function saveDepartment(dept: Partial<Department> & { name: string; code: string }): Department {
  const depts = getDepartments();
  const existingIndex = depts.findIndex(d => d.id === dept.id);
  const now = new Date().toISOString();

  let updatedDept: Department;
  if (existingIndex >= 0) {
    updatedDept = { ...depts[existingIndex], ...dept, updated_at: now };
    depts[existingIndex] = updatedDept;
  } else {
    updatedDept = {
      id: dept.id || `dept-${Date.now()}`,
      code: dept.code.toUpperCase(),
      name: dept.name,
      responsible_name: dept.responsible_name || 'Joaclinop',
      description: dept.description || '',
      created_at: now,
      updated_at: now
    };
    depts.push(updatedDept);
  }
  setItem(KEYS.DEPARTMENTS, depts);
  return updatedDept;
}

// -------------------------------------------------------------
// CATEGORIAS & SUBCATEGORIAS
// -------------------------------------------------------------
export function getCategories(): Category[] {
  initializeStorage();
  return getItem(KEYS.CATEGORIES, INITIAL_CATEGORIES);
}

export function saveCategory(category: Partial<Category> & { name: string; code: string }): Category {
  const categories = getCategories();
  const existingIndex = categories.findIndex(c => c.id === category.id);

  let updatedCat: Category;
  if (existingIndex >= 0) {
    updatedCat = { ...categories[existingIndex], ...category };
    categories[existingIndex] = updatedCat;
  } else {
    updatedCat = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name,
      code: category.code.toUpperCase(),
      description: category.description || '',
      icon: category.icon || 'Box',
      is_custom: true,
      is_active: true,
      subcategories: category.subcategories || [],
      created_at: new Date().toISOString()
    };
    categories.push(updatedCat);
  }
  setItem(KEYS.CATEGORIES, categories);
  return updatedCat;
}

export function addSubcategory(categoryId: string, subName: string): Category | null {
  const categories = getCategories();
  const category = categories.find(c => c.id === categoryId);
  if (!category) return null;

  if (!category.subcategories) category.subcategories = [];
  const newSub = {
    id: `sub-${Date.now()}`,
    category_id: categoryId,
    name: subName,
    created_at: new Date().toISOString()
  };
  category.subcategories.push(newSub);
  setItem(KEYS.CATEGORIES, categories);
  return category;
}

// -------------------------------------------------------------
// LOCALIZAÇÕES
// -------------------------------------------------------------
export function getLocations(): LocationItem[] {
  initializeStorage();
  return getItem(KEYS.LOCATIONS, INITIAL_LOCATIONS);
}

export function saveLocation(loc: Partial<LocationItem> & { building: string; room: string }): LocationItem {
  const locations = getLocations();
  const existingIndex = locations.findIndex(l => l.id === loc.id);

  const fullName = `${loc.building}${loc.floor ? ` -> ${loc.floor}` : ''} -> ${loc.room}`;
  let updatedLoc: LocationItem;
  if (existingIndex >= 0) {
    updatedLoc = { ...locations[existingIndex], ...loc, full_name: fullName };
    locations[existingIndex] = updatedLoc;
  } else {
    updatedLoc = {
      id: loc.id || `loc-${Date.now()}`,
      building: loc.building,
      floor: loc.floor || '',
      room: loc.room,
      full_name: fullName,
      description: loc.description || '',
      is_active: true,
      created_at: new Date().toISOString()
    };
    locations.push(updatedLoc);
  }
  setItem(KEYS.LOCATIONS, locations);
  return updatedLoc;
}

// -------------------------------------------------------------
// ESTADOS DE CONSERVAÇÃO
// -------------------------------------------------------------
export function getAssetStates(): AssetState[] {
  initializeStorage();
  return getItem(KEYS.STATES, INITIAL_STATES);
}

export function saveAssetState(state: Partial<AssetState> & { name: string; code: string }): AssetState {
  const states = getAssetStates();
  const existingIndex = states.findIndex(s => s.id === state.id);

  let updatedState: AssetState;
  if (existingIndex >= 0) {
    updatedState = { ...states[existingIndex], ...state };
    states[existingIndex] = updatedState;
  } else {
    updatedState = {
      id: state.id || `st-${Date.now()}`,
      code: state.code.toUpperCase(),
      name: state.name,
      color: state.color || 'blue',
      is_custom: true,
      is_active: true,
      created_at: new Date().toISOString()
    };
    states.push(updatedState);
  }
  setItem(KEYS.STATES, states);
  return updatedState;
}

// -------------------------------------------------------------
// INVENTÁRIOS SIMPLES (COM SYNC SUPABASE)
// -------------------------------------------------------------
export function getInventories(): Inventory[] {
  initializeStorage();
  // Disparar sincronização assíncrona com Supabase em segundo plano
  syncWithSupabase().catch(err => console.error(err));
  return getItem(KEYS.INVENTORIES, []);
}

export function getInventoriesByResponsible(responsibleName?: string): Inventory[] {
  const all = getInventories();
  if (!responsibleName || !responsibleName.trim()) return all;
  const q = responsibleName.trim().toLowerCase();
  return all.filter(i => i.responsible_name.toLowerCase().includes(q));
}

export function saveInventory(inv: Partial<Inventory> & { responsible_name: string; title: string }): Inventory {
  const inventories = getInventories();
  const existingIndex = inventories.findIndex(i => i.id === inv.id);
  const now = new Date().toISOString();

  let updatedInv: Inventory;
  if (existingIndex >= 0) {
    updatedInv = { ...inventories[existingIndex], ...inv, updated_at: now };
    inventories[existingIndex] = updatedInv;
  } else {
    const deptId = inv.department_id || `dept-${Date.now()}`;
    updatedInv = {
      id: inv.id || `inv-${Date.now()}`,
      department_id: deptId,
      title: inv.title,
      status: inv.status || 'in_progress',
      start_date: inv.start_date || new Date().toISOString().split('T')[0],
      responsible_name: inv.responsible_name.trim(),
      general_notes: inv.general_notes || '',
      created_at: now,
      updated_at: now
    };
    inventories.unshift(updatedInv);
  }
  setItem(KEYS.INVENTORIES, inventories);

  // Enviar assincronamente para a base de dados Supabase
  const supabase = createClient();
  if (supabase) {
    supabase
      .from('inventories')
      .upsert({
        id: updatedInv.id,
        department_id: updatedInv.department_id,
        title: updatedInv.title,
        status: updatedInv.status,
        start_date: updatedInv.start_date,
        end_date: updatedInv.end_date,
        responsible_name: updatedInv.responsible_name,
        general_notes: updatedInv.general_notes,
        responsible_signature: updatedInv.responsible_signature,
        admin_validation_signature: updatedInv.admin_validation_signature,
        validated_by: updatedInv.validated_by,
        validated_at: updatedInv.validated_at,
        created_at: updatedInv.created_at,
        updated_at: updatedInv.updated_at
      })
      .then(({ error }) => {
        if (error) console.error('Erro ao guardar inventário no Supabase:', error);
      });
  }

  return updatedInv;
}

// -------------------------------------------------------------
// GERADOR DE CÓDIGO ÚNICO DE BEM
// -------------------------------------------------------------
export function generateNextAssetCode(categoryCode?: string, isQuantity?: boolean): string {
  const assets = getAssets();
  const prefix = isQuantity && categoryCode ? `TWFTW-${categoryCode.toUpperCase()}-` : 'TWFTW-';

  const matchingCodes = assets
    .map(a => a.asset_code)
    .filter(code => code && code.startsWith(prefix));

  let maxNum = 0;
  matchingCodes.forEach(code => {
    const numPart = code.replace(prefix, '');
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed) && parsed > maxNum) {
      maxNum = parsed;
    }
  });

  const nextNum = maxNum + 1;
  const padded = nextNum.toString().padStart(6, '0');
  return `${prefix}${padded}`;
}

// -------------------------------------------------------------
// BENS E ATIVOS (ASSETS COM SYNC SUPABASE)
// -------------------------------------------------------------
export function getAssets(): Asset[] {
  initializeStorage();
  return getItem(KEYS.ASSETS, []);
}

export function getAssetById(idOrCode: string): Asset | undefined {
  const assets = getAssets();
  return assets.find(a => a.id === idOrCode || (a.asset_code && a.asset_code.toUpperCase() === idOrCode.toUpperCase()));
}

export function saveAsset(assetData: Partial<Asset> & { description: string; responsible_name: string }): Asset {
  const assets = getAssets();
  const existingIndex = assets.findIndex(a => a.id === assetData.id);
  const now = new Date().toISOString();

  let categoryCode = 'GEN';
  if (assetData.category_id) {
    const cats = getCategories();
    const c = cats.find(cat => cat.id === assetData.category_id);
    if (c) categoryCode = c.code;
  }

  const code = assetData.asset_code || generateNextAssetCode(categoryCode, assetData.is_quantity_controlled);

  let updatedAsset: Asset;
  if (existingIndex >= 0) {
    updatedAsset = {
      ...assets[existingIndex],
      ...assetData,
      asset_code: code,
      updated_at: now,
      last_inventoried_at: now
    };
    assets[existingIndex] = updatedAsset;
  } else {
    updatedAsset = {
      id: assetData.id || `ast-${Date.now()}`,
      department_id: assetData.department_id || 'dept-geral',
      inventory_id: assetData.inventory_id,
      asset_code: code,
      internal_id: assetData.internal_id || code,
      category_id: assetData.category_id,
      subcategory_id: assetData.subcategory_id,
      category_name: assetData.category_name || 'Geral',
      subcategory_name: assetData.subcategory_name || '',
      description: assetData.description,
      brand: assetData.brand || '',
      model: assetData.model || '',
      serial_number: assetData.serial_number || '',
      existing_id: assetData.existing_id || '',
      is_quantity_controlled: !!assetData.is_quantity_controlled,
      quantity: assetData.quantity && assetData.quantity > 0 ? assetData.quantity : 1,
      unit: assetData.unit || 'un',
      responsible_name: assetData.responsible_name,
      location_id: assetData.location_id,
      location_name: assetData.location_name || 'Geral',
      room: assetData.room || '',
      building: assetData.building || '',
      state_id: assetData.state_id,
      state_name: assetData.state_name || 'Bom',
      situation: assetData.situation || 'Em uso',
      acquisition_value: assetData.acquisition_value,
      currency: assetData.currency || 'Kz',
      acquisition_date: assetData.acquisition_date,
      supplier: assetData.supplier,
      invoice_number: assetData.invoice_number,
      estimated_current_value: assetData.estimated_current_value,
      physical_check_status: assetData.physical_check_status || 'found',
      notes: assetData.notes || '',
      photos: assetData.photos || [],
      first_registered_at: now,
      last_inventoried_at: now,
      last_confirmed_by: assetData.responsible_name,
      last_confirmed_state: assetData.state_name || 'Bom',
      created_at: now,
      updated_at: now
    };
    assets.unshift(updatedAsset);
  }

  setItem(KEYS.ASSETS, assets);

  // Enviar assincronamente para a base de dados Supabase
  const supabase = createClient();
  if (supabase) {
    supabase
      .from('assets')
      .upsert({
        id: updatedAsset.id,
        inventory_id: updatedAsset.inventory_id,
        department_id: updatedAsset.department_id,
        internal_id: updatedAsset.internal_id,
        asset_code: updatedAsset.asset_code,
        category_name: updatedAsset.category_name,
        subcategory_name: updatedAsset.subcategory_name,
        description: updatedAsset.description,
        brand: updatedAsset.brand,
        model: updatedAsset.model,
        serial_number: updatedAsset.serial_number,
        is_quantity_controlled: updatedAsset.is_quantity_controlled,
        quantity: updatedAsset.quantity,
        unit: updatedAsset.unit,
        responsible_name: updatedAsset.responsible_name,
        location_name: updatedAsset.location_name,
        room: updatedAsset.room,
        building: updatedAsset.building,
        state_name: updatedAsset.state_name,
        situation: updatedAsset.situation,
        physical_check_status: updatedAsset.physical_check_status,
        notes: updatedAsset.notes,
        created_at: updatedAsset.created_at,
        updated_at: updatedAsset.updated_at
      })
      .then(({ error }) => {
        if (error) console.error('Erro ao guardar bem no Supabase:', error);
      });
  }

  return updatedAsset;
}

export function updatePhysicalCheckStatus(assetId: string, status: PhysicalCheckStatus, confirmedBy?: string): Asset | null {
  const assets = getAssets();
  const asset = assets.find(a => a.id === assetId);
  if (!asset) return null;

  asset.physical_check_status = status;
  asset.last_inventoried_at = new Date().toISOString();
  if (confirmedBy) asset.last_confirmed_by = confirmedBy;

  setItem(KEYS.ASSETS, assets);

  const supabase = createClient();
  if (supabase) {
    supabase
      .from('assets')
      .update({
        physical_check_status: status,
        last_inventoried_at: asset.last_inventoried_at,
        last_confirmed_by: confirmedBy
      })
      .eq('id', assetId)
      .then(({ error }) => {
        if (error) console.error('Erro ao atualizar conferência no Supabase:', error);
      });
  }

  return asset;
}

export function deleteAsset(assetId: string): boolean {
  const assets = getAssets();
  const asset = assets.find(a => a.id === assetId);
  if (!asset) return false;

  const filtered = assets.filter(a => a.id !== assetId);
  setItem(KEYS.ASSETS, filtered);

  const supabase = createClient();
  if (supabase) {
    supabase.from('assets').delete().eq('id', assetId).then();
  }

  return true;
}

export function getAuditLogs(): AuditLog[] {
  initializeStorage();
  return getItem(KEYS.AUDIT_LOGS, []);
}
