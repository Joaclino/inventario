import { Department, Inventory } from '@/types/inventory';
import TWFTWLogo from './TWFTWLogo';

interface PrintHeaderProps {
  department: Department;
  inventory?: Inventory;
  title?: string;
}

export default function PrintHeader({ department, inventory, title }: PrintHeaderProps) {
  return (
    <div className="print-only print-container mb-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-twftw-navy text-amber-400 p-2 flex items-center justify-center">
            <TWFTWLogo className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
              The Word For The World - Angola (TWFTW - Angola)
            </h1>
            <h2 className="text-sm font-bold text-slate-700">
              {title || 'INVENTÁRIO GERAL DE BENS E ATIVOS'}
            </h2>
          </div>
        </div>
        <div className="text-right text-xs text-slate-700">
          <p className="font-mono font-bold">Data do Relatório: {new Date().toLocaleDateString('pt-PT')}</p>
          <p className="font-bold">
            Estado: {inventory?.status === 'validated' ? 'VALIDADO' : inventory?.status === 'completed' ? 'CONCLUÍDO' : 'EM CURSO'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs mb-4 p-3 bg-slate-100 rounded border border-slate-300">
        <div>
          <p><strong className="uppercase">Área / Inventário:</strong> {inventory?.title || department.name}</p>
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

