import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, BarChart3, PieChart, Users, Trophy, Calendar, 
  Search, Zap, Dices, Clock, Sparkles, Settings, Save, Trash2, 
  PlusCircle, Gift, Check 
} from 'lucide-react';
import { Raffle, Ticket, Contributor } from '../../types';
import { getWinnerNameByOrderNumber } from '../../utils';

interface AdminDashboardProps {
  raffle: Raffle;
  setRaffle: (raffle: Raffle) => void;
  tickets: Ticket[];
  contributors: Contributor[];
  handleLogoutAdmin: () => void;
  activeAdminTab: 'stats' | 'config' | 'buyers' | 'micro';
  setActiveAdminTab: (tab: 'stats' | 'config' | 'buyers' | 'micro') => void;
  rankingFilter: 'geral' | 'diaria' | 'semanal' | 'mensal';
  setRankingFilter: (filter: 'geral' | 'diaria' | 'semanal' | 'mensal') => void;
  rankingDate: string;
  setRankingDate: (date: string) => void;
  microWinner: { name: string; prize: string } | null;
  setMicroWinner: (winner: { name: string; prize: string } | null) => void;
  isRaffling: boolean;
  setIsRaffling: (val: boolean) => void;
  microPrizeInput: string;
  setMicroPrizeInput: (val: string) => void;
  microStartTime: string;
  setMicroStartTime: (val: string) => void;
  microEndTime: string;
  setMicroEndTime: (val: string) => void;
  handleRunMicroRaffle: (type: 'random' | 'time') => void;
  setIsAdmin: (val: boolean) => void;
  setIsAdminAuthenticated: (val: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  raffle,
  setRaffle,
  tickets,
  contributors,
  handleLogoutAdmin,
  activeAdminTab,
  setActiveAdminTab,
  rankingFilter,
  setRankingFilter,
  rankingDate,
  setRankingDate,
  microWinner,
  setMicroWinner,
  isRaffling,
  setIsRaffling,
  microPrizeInput,
  setMicroPrizeInput,
  microStartTime,
  setMicroStartTime,
  microEndTime,
  setMicroEndTime,
  handleRunMicroRaffle,
  setIsAdmin,
  setIsAdminAuthenticated
}) => {
  return (
    <>
      {/* Admin Header */}
      <header className="py-8 px-6 flex flex-col md:flex-row items-center justify-between sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-50 border-b border-white/5 gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogoutAdmin}
            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black font-display tracking-tight text-white">Dashboard</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Administração do Sorteio</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center bg-white/5 p-1 rounded-xl border border-white/10 gap-1">
          {[
            { id: 'stats', label: 'Métricas' },
            { id: 'buyers', label: 'Compradores' },
            { id: 'micro', label: 'Micro Sorteios' },
            { id: 'config', label: 'Configurações' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeAdminTab === tab.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        {activeAdminTab === 'stats' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Arrecadado</p>
                  <p className="text-2xl font-black font-display tracking-tight text-white">R$ 12.450,00</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <PieChart className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Bilhetes Vendidos</p>
                  <p className="text-2xl font-black font-display tracking-tight text-white">24.900 / {raffle.totalTickets}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <Users className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Compradores Únicos</p>
                  <p className="text-2xl font-black font-display tracking-tight text-white">1.240</p>
                </div>
              </div>
            </div>

            {/* Buyer Ranking */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase flex items-center gap-2">
                    <Trophy size={14} /> Ranking de Compradores
                  </h3>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Top 10 compradores por período</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {(['geral', 'diaria', 'semanal', 'mensal'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setRankingFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                          rankingFilter === filter 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {rankingFilter !== 'geral' && (
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={12} />
                      <input 
                        type={rankingFilter === 'mensal' ? 'month' : 'date'}
                        value={rankingDate}
                        onChange={(e) => setRankingDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-[10px] font-bold outline-none focus:border-emerald-500/50 transition-all text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {contributors.filter(c => c.category === rankingFilter).slice(0, 10).map((contributor, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${idx < 3 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${contributor.color} rounded-xl flex items-center justify-center text-white font-black shadow-lg`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{contributor.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{contributor.ticketCount} Bilhetes adquiridos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-400">R$ {(contributor.ticketCount * raffle.pricePerTicket).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeAdminTab === 'buyers' && (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase flex items-center gap-2">
                  <Users size={14} /> Listagem de Compradores
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Buscar comprador..."
                    className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold outline-none focus:border-emerald-500/50 transition-all w-48 text-white"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Pedido</th>
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Data/Hora</th>
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Cliente</th>
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Qtd</th>
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valor</th>
                      <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tickets.map((ticket) => (
                      <tr key={ticket.orderNumber} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 text-[10px] font-mono text-gray-400">#{ticket.orderNumber}</td>
                        <td className="py-4 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{ticket.date}</td>
                        <td className="py-4">
                          <p className="text-xs font-black text-white uppercase tracking-tight">{ticket.name}</p>
                          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{ticket.phone}</p>
                        </td>
                        <td className="py-4 text-xs font-black text-white">{ticket.numbers.length}</td>
                        <td className="py-4 text-xs font-black text-emerald-400">R$ {(ticket.numbers.length * raffle.pricePerTicket).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${ticket.status === 'pago' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeAdminTab === 'micro' && (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="text-xs font-black tracking-[0.2em] text-purple-400 uppercase flex items-center gap-2">
                  <Zap size={14} /> Micro Sorteios
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-white">Realize sorteios rápidos entre os compradores</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Prêmio do Sorteio</label>
                <input 
                  type="text" 
                  placeholder="Ex: R$ 50,00 no PIX"
                  value={microPrizeInput}
                  onChange={(e) => setMicroPrizeInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-purple-500/50 transition-all text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-purple-500/30 transition-all text-left group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Dices className="text-purple-400" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">Sorteio Aleatório</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Todos os pedidos pagos</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRunMicroRaffle('random')}
                    disabled={isRaffling}
                    className="w-full bg-purple-500 hover:bg-purple-400 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] disabled:opacity-50"
                  >
                    {isRaffling ? 'Sorteando...' : 'Sortear Agora'}
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 hover:border-blue-500/30 transition-all text-left group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">Filtro por Horário</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Período específico</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Início</label>
                      <input 
                        type="datetime-local" 
                        value={microStartTime}
                        onChange={(e) => setMicroStartTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-500/50 transition-all text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-gray-500 font-black uppercase tracking-widest ml-1">Fim</label>
                      <input 
                        type="datetime-local" 
                        value={microEndTime}
                        onChange={(e) => setMicroEndTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-500/50 transition-all text-white"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRunMicroRaffle('time')}
                    disabled={isRaffling}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] disabled:opacity-50"
                  >
                    {isRaffling ? 'Sorteando...' : 'Filtrar e Sortear'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isRaffling && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-6 backdrop-blur-md"
                  >
                    <div className="relative w-20 h-20 mx-auto">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="absolute inset-0 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
                      />
                      <Dices className="absolute inset-0 m-auto text-purple-400 animate-pulse" size={32} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black font-display tracking-tight uppercase text-white">Sorteando...</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cruzando dados dos compradores</p>
                    </div>
                  </motion.div>
                )}

                {microWinner && !isRaffling && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-purple-500 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl shadow-purple-500/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                      <Sparkles size={40} />
                    </div>
                    <Trophy className="mx-auto" size={48} />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Ganhador do Micro Sorteio</p>
                      <h4 className="text-2xl font-black font-display tracking-tight uppercase">{microWinner.name}</h4>
                    </div>
                    <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full">
                      <p className="text-sm font-black uppercase tracking-widest">Prêmio: {microWinner.prize}</p>
                    </div>
                    <button 
                      onClick={() => setMicroWinner(null)}
                      className="block mx-auto text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                    >
                      Fechar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 space-y-4">
                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Últimos Micro Sorteios</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <span>Ganhador: Murilo Souza</span>
                    <span>Prêmio: R$ 50,00</span>
                    <span>24/02/2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeAdminTab === 'config' && (
          <div className="space-y-8 pb-20">
            {/* General Config */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-8">
              <h3 className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase flex items-center gap-2">
                <Settings size={14} /> Configurações Gerais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Título do Sorteio</label>
                  <input 
                    type="text" 
                    value={raffle.title}
                    onChange={(e) => setRaffle({...raffle, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Valor por Bilhete (R$)</label>
                  <input 
                    type="number" 
                    value={raffle.pricePerTicket}
                    onChange={(e) => setRaffle({...raffle, pricePerTicket: parseFloat(e.target.value) || 0})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Data de Finalização</label>
                  <input 
                    type="date" 
                    value={raffle.endDate || ''}
                    onChange={(e) => setRaffle({...raffle, endDate: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Status do Sorteio</label>
                  <select 
                    value={raffle.status}
                    onChange={(e) => setRaffle({...raffle, status: e.target.value as any})}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all appearance-none text-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>
                {raffle.status === 'finished' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Ganhador do Sorteio</label>
                    <input 
                      type="text" 
                      value={raffle.winner || ''}
                      placeholder="Nome do ganhador"
                      onChange={(e) => setRaffle({...raffle, winner: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all text-white"
                    />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Descrição</label>
                  <textarea 
                    value={raffle.description}
                    onChange={(e) => setRaffle({...raffle, description: e.target.value})}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all resize-none text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">URL da Imagem</label>
                  <input 
                    type="text" 
                    value={raffle.imageUrl}
                    onChange={(e) => setRaffle({...raffle, imageUrl: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Total de Bilhetes</label>
                  <input 
                    type="number" 
                    value={raffle.totalTickets}
                    onChange={(e) => setRaffle({...raffle, totalTickets: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all text-white"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white uppercase tracking-tight">Bloquear Vendas</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Impede novos pedidos no site</p>
                  </div>
                  <button 
                    onClick={() => setRaffle({...raffle, salesBlocked: !raffle.salesBlocked})}
                    className={`w-14 h-8 rounded-full transition-all relative ${raffle.salesBlocked ? 'bg-red-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${raffle.salesBlocked ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white uppercase tracking-tight">Ranking de Colaboradores</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Exibe os maiores compradores na home</p>
                  </div>
                  <button 
                    onClick={() => setRaffle({...raffle, rankingEnabled: !raffle.rankingEnabled})}
                    className={`w-14 h-8 rounded-full transition-all relative ${raffle.rankingEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${raffle.rankingEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {raffle.rankingEnabled && (
                <div className="space-y-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Prêmios do Top 3</p>
                  <div className="grid grid-cols-1 gap-3">
                    {raffle.top3Prizes.map((prize, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-gray-300/20 text-gray-300' : 'bg-orange-500/20 text-orange-500'}`}>
                          {idx + 1}º
                        </div>
                        <input 
                          type="text" 
                          value={prize}
                          onChange={(e) => {
                            const newPrizes = [...raffle.top3Prizes];
                            newPrizes[idx] = e.target.value;
                            setRaffle({...raffle, top3Prizes: newPrizes});
                          }}
                          className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mystery Box Config */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black tracking-[0.2em] text-purple-400 uppercase flex items-center gap-2">
                  <Gift size={14} /> Configurações da Caixa Misteriosa
                </h3>
                <button 
                  onClick={() => setRaffle({...raffle, mysteryBox: {...raffle.mysteryBox, enabled: !raffle.mysteryBox.enabled}})}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${raffle.mysteryBox.enabled ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-500'}`}
                >
                  {raffle.mysteryBox.enabled ? 'Ativado' : 'Desativado'}
                </button>
              </div>

              {raffle.mysteryBox.enabled && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Probabilidade de Ganhar (%)</label>
                      <input 
                        type="number" 
                        value={raffle.mysteryBox.winProbability * 100}
                        onChange={(e) => setRaffle({...raffle, mysteryBox: {...raffle.mysteryBox, winProbability: (parseFloat(e.target.value) || 0) / 100}})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-purple-500/50 transition-all text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1 text-white">Regras de Quantidade</p>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors">
                        <PlusCircle size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {raffle.mysteryBox.rules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Min. Bilhetes</p>
                              <input 
                                type="number" 
                                value={rule.minTickets}
                                onChange={(e) => {
                                  const newRules = [...raffle.mysteryBox.rules];
                                  newRules[idx].minTickets = parseInt(e.target.value) || 0;
                                  setRaffle({...raffle, mysteryBox: {...raffle.mysteryBox, rules: newRules}});
                                }}
                                className="w-full bg-transparent border-none outline-none font-bold text-sm text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Qtd. Caixas</p>
                              <input 
                                type="number" 
                                value={rule.boxes}
                                onChange={(e) => {
                                  const newRules = [...raffle.mysteryBox.rules];
                                  newRules[idx].boxes = parseInt(e.target.value) || 0;
                                  setRaffle({...raffle, mysteryBox: {...raffle.mysteryBox, rules: newRules}});
                                }}
                                className="w-full bg-transparent border-none outline-none font-bold text-sm text-white"
                              />
                            </div>
                          </div>
                          <button className="text-gray-600 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1 text-white">Prêmios Disponíveis</p>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors">
                        <PlusCircle size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {raffle.mysteryBox.prizes.map((prize, idx) => (
                        <div key={prize.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Nome do Prêmio</p>
                                <input 
                                  type="text" 
                                  value={prize.name}
                                  onChange={(e) => {
                                    const newPrizes = [...raffle.mysteryBox.prizes];
                                    newPrizes[idx].name = e.target.value;
                                    setRaffle({...raffle, mysteryBox: {...raffle.mysteryBox, prizes: newPrizes}});
                                  }}
                                  className="w-full bg-transparent border-none outline-none font-bold text-sm text-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Probabilidade Individual (%)</p>
                                <input 
                                  type="number" 
                                  placeholder="Global"
                                  value={prize.probability !== null ? prize.probability * 100 : ''}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? null : parseFloat(e.target.value) / 100;
                                    const newPrizes = [...raffle.mysteryBox.prizes];
                                    newPrizes[idx].probability = val;
                                    setRaffle({...raffle, mysteryBox: {...raffle.mysteryBox, prizes: newPrizes}});
                                  }}
                                  className="w-full bg-transparent border-none outline-none font-bold text-sm text-purple-400 placeholder:text-gray-600"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Ganhador:</p>
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                {prize.winnerOrderNumber ? `${getWinnerNameByOrderNumber(prize.winnerOrderNumber, tickets)} (#${prize.winnerOrderNumber})` : 'Aguardando...'}
                              </p>
                            </div>
                          </div>
                          <button className="text-gray-600 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
              <button 
                onClick={() => {
                  setIsAdminAuthenticated(false);
                  setIsAdmin(false);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-5 rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Save size={20} />
                <span className="tracking-[0.2em] uppercase">Salvar Alterações</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};
