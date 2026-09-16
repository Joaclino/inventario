export type UserRole = 'ADMIN' | 'DEPARTMENT_USER';

export type InventoryStatus = 'in_progress' | 'completed' | 'validated';

export type PhysicalCheckStatus = 'found' | 'not_found' | 'needs_verification';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id?: string;
  created_at?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  responsible_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  is_custom?: boolean;
  is_active?: boolean;
  subcategories?: Subcategory[];
  created_at?: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface LocationItem {
  id: string;
  building: string;
  floor?: string;
  room: string;
  full_name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface AssetState {
  id: string;
  code: string;
  name: string;
  color?: string;
  is_custom?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface Inventory {
  id: string;
  department_id: string;
  title: string;
  status: InventoryStatus;
  start_date: string;
  end_date?: string;
  responsible_name: string;
  general_notes?: string;
  responsible_signature?: string;
  admin_validation_signature?: string;
  validated_by?: string;
  validated_at?: string;
  created_at?: string;
  updated_at?: string;
  department?: Department;
}

export interface AssetPhoto {
  id: string;
  asset_id: string;
  photo_url: string;
  caption?: string;
  photo_type?: 'asset' | 'label' | 'serial';
  created_at?: string;
}

export interface Asset {
  id: string;
  inventory_id?: string;
  department_id: string;
  internal_id?: string;
  asset_code: string; // Ex: ORG-000001 ou ORG-COZ-0001
  category_id?: string;
  subcategory_id?: string;
  category_name: string;
  subcategory_name?: string;
  description: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  existing_id?: string;
  is_quantity_controlled: boolean;
  quantity: number;
  unit: string;
  responsible_name: string;
  location_id?: string;
  location_name: string;
  room?: string;
  building?: string;
  state_id?: string;
  state_name: string;
  situation: string; // Em uso, Em armazenamento, Em manutenção, Em empréstimo, Sem uso, Danificado, Perdido, Abatido
  acquisition_value?: number;
  currency: string; // Kz por defeito
  acquisition_date?: string;
  supplier?: string;
  invoice_number?: string;
  estimated_current_value?: number;
  physical_check_status: PhysicalCheckStatus;
  notes?: string;
  photos?: AssetPhoto[];
  first_registered_at?: string;
  last_inventoried_at?: string;
  last_confirmed_by?: string;
  last_confirmed_state?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: 'create' | 'update' | 'delete' | 'state_change' | 'complete' | 'validate';
  entity_type: 'asset' | 'inventory' | 'department' | 'category' | 'location';
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
}
