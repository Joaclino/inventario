import * as XLSX from 'xlsx';
import { Asset, Department, Inventory } from '@/types/inventory';

export function formatCurrencyKz(val?: number): string {
  if (val === undefined || val === null) return '0,00 Kz';
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2
  }).format(val).replace('AOA', 'Kz');
}

export function exportDepartmentInventoryToExcel(
  department: Department,
  inventory: Inventory | undefined,
  assets: Asset[]
) {
  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // FOLHA 1 — INVENTÁRIO (Lista de Bens)
  // -------------------------------------------------------------
  const inventoryRows = assets.map((a, index) => ({
    'Nº': index + 1,
    'Código Patrimonial': a.asset_code,
    'Categoria': a.category_name,
    'Subcategoria': a.subcategory_name || '-',
    'Descrição do Bem': a.description,
    'Marca': a.brand || '-',
    'Modelo': a.model || '-',
    'Nº Série': a.serial_number || '-',
    'Nº Existente / ID': a.existing_id || a.internal_id || '-',
    'Quantidade': a.quantity,
    'Unidade': a.unit || 'un',
    'Responsável': a.responsible_name,
    'Localização': a.location_name,
    'Edifício': a.building || '-',
    'Sala': a.room || '-',
    'Estado de Conservação': a.state_name,
    'Situação': a.situation,
    'Confirmação Física': a.physical_check_status === 'found' ? 'Encontrado' : a.physical_check_status === 'not_found' ? 'Não encontrado' : 'Verificar',
    'Valor Aquisição (Kz)': a.acquisition_value ? a.acquisition_value : 0,
    'Valor Estimado Atual (Kz)': a.estimated_current_value ? a.estimated_current_value : 0,
    'Observações': a.notes || '-'
  }));

  // Linha de totalizador
  const totalQty = assets.reduce((sum, a) => sum + (a.quantity || 1), 0);
  const totalAcquisition = assets.reduce((sum, a) => sum + (a.acquisition_value || 0), 0);
  const totalEstimated = assets.reduce((sum, a) => sum + (a.estimated_current_value || 0), 0);

  const totalRow = {
    'Nº': 'TOTAL',
    'Código Patrimonial': '',
    'Categoria': '',
    'Subcategoria': '',
    'Descrição do Bem': `Total de ${assets.length} registos (${totalQty} itens)`,
    'Marca': '',
    'Modelo': '',
    'Nº Série': '',
    'Nº Existente / ID': '',
    'Quantidade': totalQty,
    'Unidade': '',
    'Responsável': '',
    'Localização': '',
    'Edifício': '',
    'Sala': '',
    'Estado de Conservação': '',
    'Situação': '',
    'Confirmação Física': '',
    'Valor Aquisição (Kz)': totalAcquisition,
    'Valor Estimado Atual (Kz)': totalEstimated,
    'Observações': ''
  };

  const sheet1Data = [...inventoryRows, totalRow];
  const wsInventory = XLSX.utils.json_to_sheet(sheet1Data);

  // Ajustar larguras das colunas
  wsInventory['!cols'] = [
    { wch: 6 },  // Nº
    { wch: 18 }, // Código
    { wch: 16 }, // Categoria
    { wch: 16 }, // Subcategoria
    { wch: 35 }, // Descrição
    { wch: 15 }, // Marca
    { wch: 15 }, // Modelo
    { wch: 18 }, // Nº Série
    { wch: 18 }, // Nº Existente
    { wch: 12 }, // Quantidade
    { wch: 10 }, // Unidade
    { wch: 22 }, // Responsável
    { wch: 35 }, // Localização
    { wch: 20 }, // Edifício
    { wch: 18 }, // Sala
    { wch: 20 }, // Estado
    { wch: 18 }, // Situação
    { wch: 18 }, // Confirmação
    { wch: 22 }, // Valor Aquisição
    { wch: 22 }, // Valor Estimado
    { wch: 30 }  // Observações
  ];

  XLSX.utils.book_append_sheet(wb, wsInventory, 'INVENTÁRIO');

  // -------------------------------------------------------------
  // FOLHA 2 — RESUMO
  // -------------------------------------------------------------
  // Agrupamento por Categoria
  const categoryCounts: Record<string, number> = {};
  assets.forEach(a => {
    categoryCounts[a.category_name] = (categoryCounts[a.category_name] || 0) + (a.quantity || 1);
  });

  // Agrupamento por Estado
  const stateCounts: Record<string, number> = {};
  assets.forEach(a => {
    stateCounts[a.state_name] = (stateCounts[a.state_name] || 0) + (a.quantity || 1);
  });

  const summaryRows = [
    { Metrica: 'ORGANIZAÇÃO', Valor: 'INVENTÁRIO GERAL DE BENS E ATIVOS' },
    { Metrica: 'DEPARTAMENTO', Valor: department.name },
    { Metrica: 'RESPONSÁVEL PELO LEVANTAMENTO', Valor: inventory?.responsible_name || department.responsible_name },
    { Metrica: 'DATA DO RELATÓRIO', Valor: new Date().toLocaleDateString('pt-PT') },
    { Metrica: '', Valor: '' },
    { Metrica: 'TOTAL DE REGISTOS DE BENS', Valor: assets.length },
    { Metrica: 'TOTAL DE ITENS/QUANTIDADES', Valor: totalQty },
    { Metrica: 'VALOR TOTAL DE AQUISIÇÃO', Valor: formatCurrencyKz(totalAcquisition) },
    { Metrica: 'VALOR ESTIMADO ATUAL', Valor: formatCurrencyKz(totalEstimated) },
    { Metrica: '', Valor: '' },
    { Metrica: '=== DISTRIBUIÇÃO POR CATEGORIA ===', Valor: '' },
    ...Object.entries(categoryCounts).map(([cat, count]) => ({
      Metrica: cat,
      Valor: `${count} item(ns)`
    })),
    { Metrica: '', Valor: '' },
    { Metrica: '=== DISTRIBUIÇÃO POR ESTADO DE CONSERVAÇÃO ===', Valor: '' },
    ...Object.entries(stateCounts).map(([st, count]) => ({
      Metrica: st,
      Valor: `${count} item(ns)`
    }))
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 45 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'RESUMO');

  // -------------------------------------------------------------
  // FOLHA 3 — INFORMAÇÕES
  // -------------------------------------------------------------
  const infoRows = [
    { Campo: 'Departamento', Informacao: department.name },
    { Campo: 'Código do Departamento', Informacao: department.code },
    { Campo: 'Responsável pelo Levantamento', Informacao: inventory?.responsible_name || department.responsible_name },
    { Campo: 'Data de Início', Informacao: inventory?.start_date || '-' },
    { Campo: 'Data de Conclusão', Informacao: inventory?.end_date || 'Em andamento' },
    { Campo: 'Estado do Inventário', Informacao: inventory?.status === 'validated' ? '🔵 Validado pelo Administrador' : inventory?.status === 'completed' ? '🟢 Concluído' : '🟡 Em Andamento' },
    { Campo: 'Observações Gerais', Informacao: inventory?.general_notes || 'Sem observações adicionais.' },
    { Campo: '', Informacao: '' },
    { Campo: 'Assinatura do Responsável pelo Levantamento', Informacao: inventory?.responsible_signature || 'Pendente de assinatura' },
    { Campo: 'Validação do Administrador / IT', Informacao: inventory?.admin_validation_signature || 'Pendente de validação do administrador' },
    { Campo: 'Validado por', Informacao: inventory?.validated_by || '-' },
    { Campo: 'Data da Validação', Informacao: inventory?.validated_at ? new Date(inventory.validated_at).toLocaleString('pt-PT') : '-' }
  ];

  const wsInfo = XLSX.utils.json_to_sheet(infoRows);
  wsInfo['!cols'] = [{ wch: 45 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, 'INFORMAÇÕES');

  // Fazer o download do ficheiro Excel
  const safeDeptName = department.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Inventario_Geral_${safeDeptName}_2026.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportAllInventoriesToExcel(
  departments: Department[],
  inventories: Inventory[],
  allAssets: Asset[]
) {
  const wb = XLSX.utils.book_new();

  // 1. INVENTÁRIO GERAL (TODOS OS BENS)
  const allRows = allAssets.map((a, index) => {
    const dept = departments.find(d => d.id === a.department_id);
    return {
      'Nº': index + 1,
      'Departamento': dept?.name || 'Desconhecido',
      'Código Patrimonial': a.asset_code,
      'Categoria': a.category_name,
      'Subcategoria': a.subcategory_name || '-',
      'Descrição do Bem': a.description,
      'Marca': a.brand || '-',
      'Modelo': a.model || '-',
      'Nº Série': a.serial_number || '-',
      'Quantidade': a.quantity,
      'Unidade': a.unit || 'un',
      'Responsável': a.responsible_name,
      'Localização': a.location_name,
      'Estado': a.state_name,
      'Situação': a.situation,
      'Valor Aquisição (Kz)': a.acquisition_value || 0,
      'Valor Estimado (Kz)': a.estimated_current_value || 0
    };
  });

  const wsAll = XLSX.utils.json_to_sheet(allRows);
  wsAll['!cols'] = [
    { wch: 6 }, { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
    { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 10 },
    { wch: 8 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
    { wch: 20 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsAll, 'INVENTÁRIO GERAL');

  // 2. RESUMO POR DEPARTAMENTO
  const deptSummary = departments.map(d => {
    const deptAssets = allAssets.filter(a => a.department_id === d.id);
    const inv = inventories.find(i => i.department_id === d.id);
    const totalQty = deptAssets.reduce((sum, a) => sum + (a.quantity || 1), 0);
    const totalValue = deptAssets.reduce((sum, a) => sum + (a.acquisition_value || 0), 0);

    return {
      'Código Dept.': d.code,
      'Departamento': d.name,
      'Responsável': d.responsible_name,
      'Total Registos': deptAssets.length,
      'Total Itens/Qtd': totalQty,
      'Estado Inventário': inv?.status === 'validated' ? 'Validado' : inv?.status === 'completed' ? 'Concluído' : 'Em andamento',
      'Valor Total Aquisição': formatCurrencyKz(totalValue)
    };
  });

  const wsDeptSummary = XLSX.utils.json_to_sheet(deptSummary);
  wsDeptSummary['!cols'] = [
    { wch: 14 }, { wch: 25 }, { wch: 22 }, { wch: 15 }, { wch: 16 }, { wch: 20 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsDeptSummary, 'RESUMO DEPARTAMENTOS');

  // 3. INFORMAÇÕES DO SISTEMA
  const sysInfo = [
    { Parametro: 'SISTEMA', Valor: 'Inventário Geral de Bens e Ativos' },
    { Parametro: 'ORGANIZAÇÃO', Valor: 'Organização Central' },
    { Parametro: 'DATA DE EXTRAÇÃO', Valor: new Date().toLocaleString('pt-PT') },
    { Parametro: 'TOTAL DE DEPARTAMENTOS', Valor: departments.length },
    { Parametro: 'TOTAL GERAL DE ATIVOS', Valor: allAssets.length },
    { Parametro: 'VALOR TOTAL GERAL (KZ)', Valor: formatCurrencyKz(allAssets.reduce((s, a) => s + (a.acquisition_value || 0), 0)) }
  ];

  const wsSysInfo = XLSX.utils.json_to_sheet(sysInfo);
  wsSysInfo['!cols'] = [{ wch: 30 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsSysInfo, 'INFORMAÇÕES');

  XLSX.writeFile(wb, 'Inventario_Geral_Organizacao_2026.xlsx');
}
