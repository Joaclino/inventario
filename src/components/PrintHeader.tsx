import { Department, Inventory } from '@/types/inventory';

interface PrintHeaderProps {
  department: Department;
  inventory?: Inventory;
  title?: string;
}

export default function PrintHeader({ department, inventory, title }: PrintHeaderProps) {
  return (
    <div className="print-only print-container mb-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">NOME DA ORGANIZAÇÃO</h1>
          <h2 className="text-lg font-semibold text-slate-800">{title || 'INVENTÁRIO GERAL DE BENS E ATIVOS'}</h2>
        </div>
        <div className="text-right text-xs text-slate-700">
          <p className="font-mono font-bold">Data: {new Date().toLocaleDateString('pt-PT')}</p>
          <p>Estado: {inventory?.status === 'validated' ? 'VALIDADO' : inventory?.status === 'completed' ? 'CONCLUÍDO' : 'EM ANDAMENTO'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs mb-4 p-3 bg-slate-100 rounded border border-slate-300">
        <div>
          <p><strong className="uppercase">Departamento:</strong> {department.name} ({department.code})</p>
          <p><strong className="uppercase">Responsável pelo Levantamento:</strong> {inventory?.responsible_name || department.responsible_name}</p>
        </div>
        <div>
          <p><strong className="uppercase">Data de Início:</strong> {inventory?.start_date || '-'}</p>
          <p><strong className="uppercase">Data de Conclusão:</strong> {inventory?.end_date || 'Em curso'}</p>
        </div>
      </div>
    </div>
  );
}
