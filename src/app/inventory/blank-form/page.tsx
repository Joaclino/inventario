'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TWFTWLogo from '@/components/TWFTWLogo';
import { Printer, ChevronLeft, FileText, CheckCircle2, Sliders } from 'lucide-react';

export default function BlankFormPage() {
  const router = useRouter();
  const [rowCount, setRowCount] = useState(20);
  const [responsibleName, setResponsibleName] = useState('');
  const [areaTitle, setAreaTitle] = useState('');

  const rows = Array.from({ length: rowCount }, (_, i) => i + 1);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* BARRA DE AÇÕES (OCULTA NA IMPRESSÃO) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center space-x-1.5 transition-all w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="py-3 px-6 bg-twftw-navy hover:bg-slate-800 text-white font-black rounded-2xl text-xs flex items-center space-x-2 shadow-lg transition-all transform active:scale-95"
            >
              <Printer className="w-4.5 h-4.5 text-amber-400" />
              <span>Imprimir Folha em Branco (A4)</span>
            </button>
          </div>
        </div>

        {/* CONTROLO DE OPÇÕES PRÉ-PREENCHIMENTO (OCULTO NA IMPRESSÃO) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-twftw-navy mb-1">
              Nome do Responsável (Opcional)
            </label>
            <input
              type="text"
              placeholder="Digite se quiser pré-preencher..."
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-twftw-navy"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase text-twftw-navy mb-1">
              Nome da Área / Setor (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Cozinha, TI, Armazém..."
              value={areaTitle}
              onChange={(e) => setAreaTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-twftw-navy"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase text-twftw-navy mb-1">
              Número de Linhas na Tabela
            </label>
            <select
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-twftw-navy"
            >
              <option value={15}>15 Linhas (Espaçamento Amplo)</option>
              <option value={20}>20 Linhas (Recomendado Padrão)</option>
              <option value={25}>25 Linhas (Compacto)</option>
              <option value={30}>30 Linhas (Máximo)</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOCUMENTO IMPRESSO (FOLHA OFICIAL A4 PARA LEVANTAMENTO MANUAL) */}
      <div className="bg-white border border-slate-300 p-6 sm:p-10 rounded-3xl shadow-sm print:p-0 print:border-none print:shadow-none print:bg-white text-slate-900">
        {/* CABEÇALHO DA ORGANIZAÇÃO */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-twftw-navy text-amber-400 p-2.5 flex items-center justify-center flex-shrink-0">
              <TWFTWLogo className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-wider text-slate-900 leading-tight">
                The Word For The World - Angola (TWFTW - Angola)
              </h1>
              <h2 className="text-xs font-bold text-slate-700 tracking-wide mt-0.5">
                FOLHA DE LEVANTAMENTO DE INVENTÁRIO FÍSICO (MANUAL)
              </h2>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-700 font-mono">
            <p className="font-bold">Doc: TWFTW-MAN-2026</p>
            <p>Data: ___ / ___ / 2026</p>
          </div>
        </div>

        {/* CAMPOS DE PREENCHIMENTO MANUAL */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-300 print:bg-slate-50 print:border-slate-400">
          <div className="space-y-2">
            <p className="flex items-center">
              <strong className="uppercase mr-2 font-black text-slate-800">Responsável pelo Levantamento:</strong>
              <span className="border-b border-dotted border-slate-800 flex-1 font-bold">
                {responsibleName || '__________________________________________'}
              </span>
            </p>
            <p className="flex items-center">
              <strong className="uppercase mr-2 font-black text-slate-800">Área / Setor / Local:</strong>
              <span className="border-b border-dotted border-slate-800 flex-1 font-bold">
                {areaTitle || '__________________________________________'}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="flex items-center">
              <strong className="uppercase mr-2 font-black text-slate-800">Data de Início:</strong>
              <span className="border-b border-dotted border-slate-800 flex-1 font-bold">___ / ___ / 2026</span>
            </p>
            <p className="flex items-center">
              <strong className="uppercase mr-2 font-black text-slate-800">Data de Conclusão:</strong>
              <span className="border-b border-dotted border-slate-800 flex-1 font-bold">___ / ___ / 2026</span>
            </p>
          </div>
        </div>

        {/* TABELA VAZIA COM IMPRESSÃO LIMPA E ESPAÇADA */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-xs border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-400">
                <th className="py-2.5 px-2 border border-slate-400 text-center w-10">Nº</th>
                <th className="py-2.5 px-3 border border-slate-400 w-32">Cód. Patrimonial</th>
                <th className="py-2.5 px-3 border border-slate-400">Descrição do Bem / Equipamento</th>
                <th className="py-2.5 px-3 border border-slate-400 w-36">Marca / Modelo / S/N</th>
                <th className="py-2.5 px-2 border border-slate-400 text-center w-14">Qtd</th>
                <th className="py-2.5 px-3 border border-slate-400 w-32">Localização Física</th>
                <th className="py-2.5 px-3 border border-slate-400 w-28">Estado</th>
                <th className="py-2.5 px-3 border border-slate-400 w-32">Observações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((num) => (
                <tr key={num} className="h-9 border-b border-slate-300">
                  <td className="py-2 px-2 border border-slate-300 text-center font-bold text-slate-600 bg-slate-50/50">
                    {num}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 font-mono text-[10px] text-slate-400"></td>
                  <td className="py-2 px-3 border border-slate-300"></td>
                  <td className="py-2 px-3 border border-slate-300"></td>
                  <td className="py-2 px-2 border border-slate-300 text-center"></td>
                  <td className="py-2 px-3 border border-slate-300"></td>
                  <td className="py-2 px-3 border border-slate-300 text-[10px] text-slate-400">
                    <span className="print:hidden">Novo / Bom / Reg / Dan.</span>
                  </td>
                  <td className="py-2 px-3 border border-slate-300"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BLOCO DE ASSINATURAS E REGRAS */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-300 text-xs text-slate-800">
          <div>
            <p className="font-extrabold uppercase mb-8">Assinatura do Responsável pelo Levantamento:</p>
            <div className="border-t border-slate-900 pt-1.5 text-center font-bold">
              {responsibleName ? responsibleName : 'Nome por Extenso e Assinatura'}
            </div>
          </div>

          <div>
            <p className="font-extrabold uppercase mb-8">Validação da Administração / IT (Joaclinop):</p>
            <div className="border-t border-slate-900 pt-1.5 text-center font-bold">
              Joaclinop (Administrador / IT)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
