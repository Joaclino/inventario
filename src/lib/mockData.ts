import { Asset, Department, Category, LocationItem, AssetState, Inventory, AuditLog } from '@/types/inventory';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-geral', code: 'GERAL', name: 'Geral / Organização', responsible_name: 'Joaclinop', description: 'Inventário Geral' },
  { id: 'dept-fin', code: 'FIN', name: 'Finanças', responsible_name: 'Responsável Finanças', description: 'Departamento Financeiro' },
  { id: 'dept-ope', code: 'OPE', name: 'Operações', responsible_name: 'Responsável Operações', description: 'Operações e Terreno' },
  { id: 'dept-it', code: 'IT', name: 'Informática & TI', responsible_name: 'Joaclinop', description: 'Tecnologia da Informação' },
  { id: 'dept-coz', code: 'COZ', name: 'Cozinha & Refeitório', responsible_name: 'Responsável Cozinha', description: 'Área de Alimentação' },
  { id: 'dept-alo', code: 'ALO', name: 'Alojamento & Quartos', responsible_name: 'Responsável Alojamento', description: 'Quartos e Residências' }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-tec',
    name: 'Tecnologia & Eletrónicos',
    code: 'TEC',
    icon: 'Laptop',
    description: 'Computadores, telemóveis, televisores, impressoras',
    subcategories: [
      { id: 'sub-lap', category_id: 'cat-tec', name: 'Laptop / Computador' },
      { id: 'sub-tel', category_id: 'cat-tec', name: 'Telefone / Telemóvel' },
      { id: 'sub-tv',  category_id: 'cat-tec', name: 'Televisor / Ecrã' },
      { id: 'sub-imp', category_id: 'cat-tec', name: 'Impressora / Aparelho' }
    ]
  },
  {
    id: 'cat-mob',
    name: 'Mobiliário',
    code: 'MOB',
    icon: 'Armchair',
    description: 'Mesas, cadeiras, armários, camas, sofás',
    subcategories: [
      { id: 'sub-mes', category_id: 'cat-mob', name: 'Mesa / Secretária' },
      { id: 'sub-cad', category_id: 'cat-mob', name: 'Cadeira / Banco' },
      { id: 'sub-arm', category_id: 'cat-mob', name: 'Armário / Estante' },
      { id: 'sub-cam', category_id: 'cat-mob', name: 'Cama / Colchão' }
    ]
  },
  {
    id: 'cat-coz',
    name: 'Cozinha & Louça',
    code: 'COZ',
    icon: 'Utensils',
    description: 'Frigoríficos, fogões, panelas, pratos, copos, talheres',
    subcategories: [
      { id: 'sub-ele', category_id: 'cat-coz', name: 'Eletrodoméstico' },
      { id: 'sub-pra', category_id: 'cat-coz', name: 'Pratos / Copos / Louça' },
      { id: 'sub-tal', category_id: 'cat-coz', name: 'Talheres / Utensílios' }
    ]
  },
  {
    id: 'cat-fer',
    name: 'Ferramentas & Equipamentos',
    code: 'FER',
    icon: 'Wrench',
    description: 'Berbequins, geradores, escadas, ferramentas manuais',
    subcategories: [
      { id: 'sub-fer-m', category_id: 'cat-fer', name: 'Ferramenta' },
      { id: 'sub-ger',   category_id: 'cat-fer', name: 'Gerador / Máquina' }
    ]
  },
  {
    id: 'cat-out',
    name: 'Outros Bens',
    code: 'OUT',
    icon: 'Package',
    description: 'Outros objetos físicos',
    subcategories: [
      { id: 'sub-geral', category_id: 'cat-out', name: 'Geral' }
    ]
  }
];

export const INITIAL_LOCATIONS: LocationItem[] = [
  { id: 'loc-1', building: 'Edifício Principal', floor: 'Térreo', room: 'Escritório', full_name: 'Edifício Principal -> Escritório' },
  { id: 'loc-2', building: 'Cozinha Central', floor: 'Térreo', room: 'Cozinha', full_name: 'Cozinha Central -> Cozinha' },
  { id: 'loc-3', building: 'Residência', floor: 'Piso 1', room: 'Quarto', full_name: 'Residência -> Quarto' }
];

export const INITIAL_STATES: AssetState[] = [
  { id: 'st-1', code: 'NEW', name: 'Novo', color: 'emerald' },
  { id: 'st-2', code: 'GOOD', name: 'Bom', color: 'blue' },
  { id: 'st-3', code: 'REGULAR', name: 'Regular', color: 'yellow' },
  { id: 'st-4', code: 'DAMAGED', name: 'Estragado / Danificado', color: 'orange' }
];

// SEM MOCK DE BENS E INVENTÁRIOS POR DEFEITO (BASE DE DADOS LIMPA)
export const INITIAL_INVENTORIES: Inventory[] = [];

export const INITIAL_ASSETS: Asset[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
