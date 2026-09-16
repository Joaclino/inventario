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
  INITIAL_STATES,
  INITIAL_INVENTORIES,
  INITIAL_ASSETS,
  INITIAL_AUDIT_LOGS
} from './mockData';

const KEYS = {
  DEPARTMENTS: 'inventario_departments_v2',
  CATEGORIES: 'inventario_categories_v2',
  LOCATIONS: 'inventario_locations_v2',
  STATES: 'inventario_states_v2',
  INVENTORIES: 'inventario_inventories_v2',
  ASSETS: 'inventario_assets_v2',
  AUDIT_LOGS: 'inventario_audit_logs_v2',
  USER_PROFILE: 'inventario_current_user_v2'
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
  if (!localStorage.getItem(KEYS.INVENTORIES)) setItem(KEYS.INVENTORIES, INITIAL_INVENTORIES);
  if (!localStorage.getItem(KEYS.ASSETS)) setItem(KEYS.ASSETS, INITIAL_ASSETS);
  if (!localStorage.getItem(KEYS.AUDIT_LOGS)) setItem(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
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
// SESSÃO E VERIFICAÇÃO DE ADMIN (JOACLINOP)
// -------------------------------------------------------------
export function getCurrentUser(): UserProfile | null {
  if (!isBrowser()) return null;
  const user = getItem<UserProfile | null>(KEYS.USER_PROFILE, null);
  if (user) return user;

  // Utilizador Padrão
  const defaultUser: UserProfile = {
    id: 'usr-joaclinop',
    full_name: 'Joaclinop',
    email: 'joaclinop@organizacao.org',
    role: 'ADMIN'
  };
  setItem(KEYS.USER_PROFILE, defaultUser);
  return defaultUser;
}

export function isUserAdmin(user?: UserProfile | null): boolean {
  const current = user || getCurrentUser();
  if (!current) return false;

  // Apenas Joaclinop tem acesso Master Admin
  const name = current.full_name.toLowerCase();
  const email = current.email.toLowerCase();
  return name.includes('joaclinop') || email.includes('joaclinop') || current.role === 'ADMIN';
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
// INVENTÁRIOS SIMPLES
// -------------------------------------------------------------
export function getInventories(): Inventory[] {
  initializeStorage();
  return getItem(KEYS.INVENTORIES, []);
}

export function getInventoryByDepartment(departmentId: string): Inventory | undefined {
  const inventories = getInventories();
  return inventories.find(i => i.department_id === departmentId);
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
    const deptId = inv.department_id || 'dept-geral';
    updatedInv = {
      id: inv.id || `inv-${Date.now()}`,
      department_id: deptId,
      title: inv.title,
      status: inv.status || 'in_progress',
      start_date: inv.start_date || new Date().toISOString().split('T')[0],
      responsible_name: inv.responsible_name,
      general_notes: inv.general_notes || '',
      created_at: now,
      updated_at: now
    };
    inventories.unshift(updatedInv);
  }
  setItem(KEYS.INVENTORIES, inventories);
  return updatedInv;
}

// -------------------------------------------------------------
// GERADOR DE CÓDIGO ÚNICO DE BEM
// -------------------------------------------------------------
export function generateNextAssetCode(categoryCode?: string, isQuantity?: boolean): string {
  const assets = getAssets();
  const prefix = isQuantity && categoryCode ? `ORG-${categoryCode.toUpperCase()}-` : 'ORG-';

  const matchingCodes = assets
    .map(a => a.asset_code)
    .filter(code => code.startsWith(prefix));

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
// BENS E ATIVOS (ASSETS)
// -------------------------------------------------------------
export function getAssets(): Asset[] {
  initializeStorage();
  return getItem(KEYS.ASSETS, []);
}

export function getAssetById(idOrCode: string): Asset | undefined {
  const assets = getAssets();
  return assets.find(a => a.id === idOrCode || a.asset_code.toUpperCase() === idOrCode.toUpperCase());
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
  return asset;
}

export function deleteAsset(assetId: string): boolean {
  const assets = getAssets();
  const asset = assets.find(a => a.id === assetId);
  if (!asset) return false;

  const filtered = assets.filter(a => a.id !== assetId);
  setItem(KEYS.ASSETS, filtered);
  return true;
}

export function getAuditLogs(): AuditLog[] {
  initializeStorage();
  return getItem(KEYS.AUDIT_LOGS, []);
}
