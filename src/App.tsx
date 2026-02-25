/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MessageCircle, Send, Instagram, Smartphone, Copy, Minus, Plus, Check, ChevronRight, Trophy, Users, Info, X, Calendar, Phone, ChevronDown, ChevronUp, Hash, Gift, Sparkles, LayoutDashboard, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminPanel } from './components/Admin/AdminPanel';
import { MOCK_USERS, MOCK_RAFFLE, MOCK_CONTRIBUTORS, MOCK_TICKETS } from './data';
import { Page, Raffle, User, Contributor, Ticket } from './types';
import { getWinnerNameByOrderNumber, maskName, maskPhone } from './utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function App() {
  const [raffle, setRaffle] = useState<Raffle>(MOCK_RAFFLE);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [ticketCount, setTicketCount] = useState(raffle.minTickets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [loginCpf, setLoginCpf] = useState('');
  const [loginCpfError, setLoginCpfError] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPhoneError, setLoginPhoneError] = useState('');
  const [loginUser, setLoginUser] = useState<any>(null);
  const [isLoginStepPhone, setIsLoginStepPhone] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);
  const [isMysteryBoxModalOpen, setIsMysteryBoxModalOpen] = useState(false);
  const [boxOpeningStatus, setBoxOpeningStatus] = useState<'closed' | 'opening' | 'opened'>('closed');
  const [boxPrize, setBoxPrize] = useState<string | null>(null);
  const [currentBoxTicket, setCurrentBoxTicket] = useState<any>(null);
  const [phoneError, setPhoneError] = useState('');
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthDate: '',
    phone: '',
    confirmPhone: ''
  });

  const validateCPF = (cpfValue: string) => {
    const cleanCpf = cpfValue.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCpf)) return false;
    
    let sum = 0;
    let rest;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanCpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanCpf.substring(10, 11))) return false;
    
    return true;
  };

  const formatCPF = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').substring(0, 11);
    let formatted = cleanValue;
    if (cleanValue.length > 3) {
      formatted = `${cleanValue.substring(0, 3)}.${cleanValue.substring(3)}`;
    }
    if (cleanValue.length > 6) {
      formatted = `${formatted.substring(0, 7)}.${cleanValue.substring(6)}`;
    }
    if (cleanValue.length > 9) {
      formatted = `${formatted.substring(0, 11)}-${cleanValue.substring(9)}`;
    }
    return formatted;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    if (cpfError) setCpfError('');
  };

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').substring(0, 11);
    let formatted = cleanValue;
    if (cleanValue.length > 0) {
      formatted = `(${cleanValue.substring(0, 2)}`;
    }
    if (cleanValue.length > 2) {
      formatted = `${formatted}) ${cleanValue.substring(2, 7)}`;
    }
    if (cleanValue.length > 7) {
      formatted = `${formatted}-${cleanValue.substring(7)}`;
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'confirmPhone') => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
    if (phoneError) setPhoneError('');
  };

  const handleCpfSubmit = () => {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (!validateCPF(cleanCpf)) {
      setCpfError('CPF inválido. Verifique os números informados.');
      return;
    }

    const foundUser = MOCK_USERS.find(u => u.cpf === cleanCpf);
    
    if (foundUser) {
      setIsNewUser(false);
      setUser({
        name: foundUser.name,
        phone: foundUser.phone,
        cpf: foundUser.cpf
      });
    } else {
      setIsNewUser(true);
    }
  };

  const handleLoginCpfSubmit = () => {
    const cleanCpf = loginCpf.replace(/\D/g, '');
    if (!validateCPF(cleanCpf)) {
      setLoginCpfError('CPF inválido.');
      return;
    }
    const foundUser = MOCK_USERS.find(u => u.cpf === cleanCpf);
    if (foundUser) {
      setLoginUser(foundUser);
      setIsLoginStepPhone(true);
      setLoginCpfError('');
    } else {
      setLoginCpfError('Usuário não encontrado.');
    }
  };

  const handleLoginPhoneSubmit = () => {
    const cleanPhone = loginPhone.replace(/\D/g, '');
    if (cleanPhone === loginUser.phone) {
      setUser(loginUser);
      setIsLoginModalOpen(false);
      setCurrentPage('tickets');
      setLoginPhoneError('');
    } else {
      setLoginPhoneError('Telefone incorreto.');
    }
  };

  const handleLoginCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setLoginCpf(formatted);
    if (loginCpfError) setLoginCpfError('');
  };

  const handleLoginPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setLoginPhone(formatted);
    if (loginPhoneError) setLoginPhoneError('');
  };

  const handleConfirm = () => {
    if (isNewUser) {
      if (!formData.email || !formData.email.includes('@')) {
        setPhoneError('Por favor, informe um e-mail válido.');
        return;
      }
      if (formData.phone !== formData.confirmPhone) {
        setPhoneError('Os números de telefone não coincidem.');
        return;
      }
      if (formData.phone.replace(/\D/g, '').length < 10) {
        setPhoneError('Telefone inválido.');
        return;
      }
      setUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
    }
    setIsModalOpen(false);
    setCurrentPage('checkout');
  };
  const pricePerTicket = MOCK_RAFFLE.pricePerTicket;
  const totalPrice = ticketCount * pricePerTicket;

  const handleReserve = () => {
    setIsModalOpen(true);
    setIsNewUser(null);
    setCpf('');
    setCpfError('');
    setPhoneError('');
    setFormData({
      name: '',
      email: '',
      birthDate: '',
      phone: '',
      confirmPhone: ''
    });
  };

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
    setLoginCpf('');
    setLoginCpfError('');
    setLoginPhone('');
    setLoginPhoneError('');
    setIsLoginStepPhone(false);
    setLoginUser(null);
  };

  const getEarnedBoxesCount = (ticketCount: number) => {
    const rules = [...raffle.mysteryBox.rules].sort((a, b) => b.minTickets - a.minTickets);
    const rule = rules.find(r => ticketCount >= r.minTickets);
    return rule ? rule.boxes : 0;
  };

  const calculateBoxes = (ticketCount: number) => {
    if (!raffle.mysteryBox.enabled) return 0;
    const allPrizesWon = raffle.mysteryBox.prizes.every(p => p.winnerOrderNumber !== null);
    if (allPrizesWon) return 0;
    return getEarnedBoxesCount(ticketCount);
  };

  const handleOpenBox = (ticket: any) => {
    setCurrentBoxTicket(ticket);
    setBoxOpeningStatus('opening');
    setIsMysteryBoxModalOpen(true);
    
    // Simulate opening animation
    setTimeout(() => {
      const availablePrizes = raffle.mysteryBox.prizes.filter(p => !p.winnerOrderNumber);
      const win = availablePrizes.length > 0 && Math.random() < raffle.mysteryBox.winProbability;
      
      let prizeFound = null;
      if (win) {
        const selectedPrizeIndex = raffle.mysteryBox.prizes.findIndex(p => p.id === availablePrizes[Math.floor(Math.random() * availablePrizes.length)].id);
        const newPrizes = [...raffle.mysteryBox.prizes];
        newPrizes[selectedPrizeIndex] = { ...newPrizes[selectedPrizeIndex], winnerOrderNumber: ticket.orderNumber };
        
        setRaffle({
          ...raffle,
          mysteryBox: {
            ...raffle.mysteryBox,
            prizes: newPrizes
          }
        });
        
        prizeFound = newPrizes[selectedPrizeIndex].name;
        setBoxPrize(prizeFound);
      } else {
        setBoxPrize(null);
      }
      setBoxOpeningStatus('opened');
      
      // Update ticket in mock database (local state only for demo)
      if (!ticket.openedBoxes) ticket.openedBoxes = [];
      ticket.openedBoxes.push({ 
        index: ticket.openedBoxes.length, 
        prize: prizeFound 
      });
    }, 2000);
  };

  const handlePay = () => {
    setCurrentPage('payment');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-500/30 bg-[#0f172a] text-white overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <AnimatePresence mode="wait">
        {currentPage === 'home' && !isAdmin && (
          <motion.div
            key="home"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
            className="relative z-10 pb-12"
          >
            {/* Header */}
            <header className="py-8 flex justify-center sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-50 border-b border-white/5">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1"
              >
                <span className="text-4xl font-black tracking-tighter font-display">Sav</span>
                <span className="text-4xl font-light tracking-widest text-emerald-400 font-display">/Awards</span>
              </motion.div>
            </header>

            <main className="max-w-2xl mx-auto px-4 mt-8 space-y-8">
              {/* Raffle Status Banner */}
              {raffle.status === 'finished' && (
                <motion.div 
                  variants={itemVariants}
                  className="bg-emerald-500 text-white p-6 rounded-3xl text-center space-y-2 shadow-lg shadow-emerald-500/20"
                >
                  <Trophy className="mx-auto mb-2" size={32} />
                  <h2 className="text-xl font-black font-display tracking-tight uppercase">Sorteio Finalizado!</h2>
                  <p className="text-sm font-bold opacity-90">Ganhador: <span className="text-white underline">{raffle.winner || 'A definir'}</span></p>
                </motion.div>
              )}
              {/* Search Bar */}
              <motion.div variants={itemVariants} className="relative group">
                <button
                  onClick={handleOpenLogin}
                  className="flex items-center justify-center w-full gap-3 px-4 py-4 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md text-gray-400 hover:text-white hover:bg-white/10 hover:border-emerald-500/30 transition-all text-center font-bold text-sm tracking-[0.2em] outline-none group"
                >
                  <Search className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                  BUSCAR MEUS BILHETES
                </button>
              </motion.div>

              {/* Hero Image */}
              <motion.div 
                variants={itemVariants}
                className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 group"
              >
                <img
                  src={raffle.imageUrl}
                  alt={raffle.title}
                  className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20"
                  >
                    POR APENAS <span className="text-white">R$ {raffle.pricePerTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants} className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight font-display leading-tight">
                  {raffle.title.split('(')[0]} <br />
                  <span className="text-emerald-400">({raffle.title.split('(')[1]}</span>
                </h1>
                <div className="h-1 w-20 bg-emerald-500 rounded-full" />
              </motion.div>

              {/* Organizer */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={raffle.organizer.avatarUrl}
                      alt={raffle.organizer.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-[#0f172a]">
                      <Check size={10} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Organizado por</p>
                    <p className="font-black text-base font-display">{raffle.organizer.name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-auto">
                  <button className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95">
                    <MessageCircle size={14} /> SUPORTE
                  </button>
                  <button className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 px-4 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95">
                    <Send size={14} /> TELEGRAM
                  </button>
                  <button className="flex items-center gap-2 bg-pink-500/10 hover:bg-pink-500 text-pink-400 hover:text-white border border-pink-500/20 px-4 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95">
                    <Instagram size={14} /> INSTAGRAM
                  </button>
                </div>
              </motion.div>

              {/* Description */}
              <motion.section variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Info size={40} />
                </div>
                <h2 className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase flex items-center gap-2">
                  <ChevronRight size={14} /> Descrição / Regulamento
                </h2>
                <div className="text-sm space-y-4 text-gray-300 leading-relaxed">
                  <p className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                    {raffle.description}
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                    {raffle.extraPrize.description} <span className="font-black text-emerald-400 ml-1">R$ {raffle.extraPrize.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
              </motion.section>

              {/* Mystery Box Promo Card */}
              {raffle.mysteryBox.enabled && raffle.status !== 'finished' && !raffle.mysteryBox.prizes.every(p => p.winnerOrderNumber !== null) && (
                <motion.section 
                  variants={itemVariants}
                  className="relative bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md border border-purple-500/30 rounded-[32px] p-8 overflow-hidden group"
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[80px] group-hover:bg-purple-500/30 transition-all" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-[80px] group-hover:bg-indigo-500/30 transition-all" />
                  
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                      <Gift size={40} className="text-white animate-bounce" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-yellow-400" />
                        <h3 className="text-xl font-black font-display tracking-tight">CAIXA MISTERIOSA</h3>
                      </div>
                      <p className="text-xs text-purple-200 font-medium leading-relaxed">
                        Ganhe caixas ao comprar grandes quantidades e concorra a prêmios instantâneos!
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {raffle.mysteryBox.rules.map((rule, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center space-y-1 group-hover:border-purple-500/30 transition-all">
                        <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">{rule.minTickets} Números</p>
                        <p className="text-lg font-black text-white">{rule.boxes} {rule.boxes === 1 ? 'Caixa' : 'Caixas'}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Mystery Box Prizes Status Card */}
              <motion.section 
                variants={itemVariants}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-8 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-[0.2em] text-emerald-400 uppercase flex items-center gap-2">
                    <Trophy size={14} /> Prêmios das Caixas
                  </h3>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {raffle.mysteryBox.prizes.filter(p => !p.winnerOrderNumber).length} Disponíveis
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {raffle.mysteryBox.prizes
                    .filter(p => raffle.status === 'finished' ? p.winnerOrderNumber !== null : true)
                    .map((prize) => (
                    <div 
                      key={prize.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        prize.winnerOrderNumber 
                          ? 'bg-white/5 border-white/5 opacity-60' 
                          : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          prize.winnerOrderNumber ? 'bg-gray-500/20' : 'bg-emerald-500/20'
                        }`}>
                          {prize.winnerOrderNumber ? <Check size={18} className="text-gray-400" /> : <Gift size={18} className="text-emerald-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{prize.name}</p>
                          {prize.winnerOrderNumber && (
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                              Ganhador: {getWinnerNameByOrderNumber(prize.winnerOrderNumber, MOCK_TICKETS)}
                            </p>
                          )}
                        </div>
                      </div>
                      {!prize.winnerOrderNumber && (
                        <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                          Disponível
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Ranking */}
              {raffle.rankingEnabled && (
                <motion.section variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-xs font-black tracking-[0.2em] text-gray-400 uppercase flex items-center justify-center gap-2">
                      <Users size={14} /> Classificação dos Colaboradores
                    </h2>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Prêmios para os maiores compradores</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-white/5">
                    {raffle.top3Prizes.map((prize, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-gray-300 text-gray-900' : 'bg-orange-500 text-white'}`}>
                          {idx + 1}º
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tight">{prize}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {MOCK_CONTRIBUTORS.filter(c => c.category === 'geral').slice(0, 3).map((user) => (
                      <motion.div 
                        key={user.rank}
                        whileHover={{ y: -5 }}
                        className="flex flex-col items-center text-center space-y-3"
                      >
                        <div className="relative">
                          <div className={`w-14 h-14 ${user.color} rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform`}>
                            <Trophy size={16} />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-white text-gray-900 w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border-2 border-[#0f172a]">
                            {user.rank}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black truncate w-full uppercase tracking-tighter">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold"><span className="text-emerald-400">{user.ticketCount.toLocaleString('pt-BR')}</span> BILHETES</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Admin Access Button */}
              <motion.div variants={itemVariants} className="flex justify-center pt-8">
                <button 
                  onClick={() => setIsAdmin(true)}
                  className="text-[10px] font-black text-gray-600 hover:text-emerald-500 uppercase tracking-[0.3em] transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard size={12} /> Painel Administrativo
                </button>
              </motion.div>

              {/* Ticket Selection */}
              {raffle.status !== 'finished' && (
                <motion.section variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                
                <h2 className="text-center text-xs font-black tracking-[0.2em] text-gray-400 uppercase">Selecione a quantidade de bilhetes</h2>
                
                <div className="grid grid-cols-4 gap-3">
                  {[1, 5, 10, 100].map((num) => (
                    <button
                      key={num}
                      onClick={() => setTicketCount(prev => prev + num)}
                      className="bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 py-3 rounded-2xl font-black text-sm transition-all active:scale-90"
                    >
                      +{num}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setTicketCount(prev => Math.max(raffle.minTickets, prev - 1))}
                    className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-90"
                  >
                    <Minus size={20} />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.max(raffle.minTickets, parseInt(e.target.value) || raffle.minTickets))}
                      className="w-full bg-white text-gray-900 py-4 rounded-2xl text-center font-black text-xl outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setTicketCount(prev => prev + 1)}
                    className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-90"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Mínimo de <span className="text-emerald-400">{raffle.minTickets}</span> bilhetes
                </p>

                <div className="flex justify-between items-end pt-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Valor total do investimento</span>
                    <div className="text-3xl font-black text-emerald-400 font-display">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  
                  {raffle.mysteryBox.enabled && (
                    calculateBoxes(ticketCount) > 0 ? (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-2xl flex items-center gap-2"
                      >
                        <Gift size={16} className="text-purple-400" />
                        <div className="text-right">
                          <p className="text-[8px] font-black text-purple-300 uppercase tracking-widest">Você ganha</p>
                          <p className="text-sm font-black text-white">{calculateBoxes(ticketCount)} {calculateBoxes(ticketCount) === 1 ? 'Caixa' : 'Caixas'}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 opacity-50"
                      >
                        <Gift size={16} className="text-gray-500" />
                        <div className="text-right">
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Você ganha</p>
                          <p className="text-sm font-black text-gray-400">Nenhuma Caixa</p>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>

                <button
                  onClick={handleReserve}
                  disabled={raffle.salesBlocked || raffle.status === 'finished'}
                  className={`relative w-full font-black py-5 rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] overflow-hidden group ${raffle.salesBlocked || raffle.status === 'finished' ? 'bg-gray-600 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative tracking-[0.2em]">
                    {raffle.status === 'finished' ? 'SORTEIO FINALIZADO' : raffle.salesBlocked ? 'VENDAS BLOQUEADAS' : 'COMPRAR AGORA'}
                  </span>
                </button>
              </motion.section>
              )}

              {/* Footer Info */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 group hover:border-emerald-500/30 transition-colors">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Método de Pagamento</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                      <Smartphone size={20} className="text-white" />
                    </div>
                    <span className="text-lg font-black font-display tracking-tighter">pix</span>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 group hover:border-blue-500/30 transition-colors">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sorteio Oficial</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                    <span className="text-[10px] font-black leading-tight uppercase tracking-tighter">Loterias<br /><span className="text-blue-400">CAIXA</span></span>
                  </div>
                </div>
              </motion.div>
            </main>
          </motion.div>
        )}

        {currentPage === 'checkout' && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="relative z-10 min-h-screen text-white pb-12"
          >
            {/* Header */}
            <header className="py-8 flex justify-center border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
              <div className="flex items-center gap-1">
                <span className="text-4xl font-black tracking-tighter font-display">Sav</span>
                <span className="text-4xl font-light tracking-widest text-emerald-400 font-display">/Awards</span>
              </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
              >
                <div className="p-8 space-y-8">
                  <h2 className="text-center text-xs font-black tracking-[0.3em] text-emerald-400 uppercase">Resumo do Pedido</h2>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Nome', value: user ? maskName(user.name) : '---' },
                      { label: 'Telefone/WhatsApp', value: user ? maskPhone(user.phone) : '---' },
                      { label: 'Quantidade de bilhetes', value: ticketCount },
                      { label: 'Caixas Misteriosas', value: calculateBoxes(ticketCount) > 0 ? `${calculateBoxes(ticketCount)} ${calculateBoxes(ticketCount) === 1 ? 'unidade' : 'unidades'}` : 'Nenhuma Caixa' },
                      { label: 'Valor Total', value: `R$ ${totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, highlight: true }
                    ].map((item, idx) => (
                      <div key={idx} className={`flex flex-col gap-1 border-b border-white/5 pb-4 ${item.highlight ? 'bg-emerald-500/5 -mx-8 px-8 py-4 border-none' : ''}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                          {item.label === 'Quantidade de bilhetes' && (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setTicketCount(prev => Math.max(raffle.minTickets, prev - 1))}
                                className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-md hover:bg-white/20 transition-all active:scale-90"
                              >
                                <Minus size={12} />
                              </button>
                              <button 
                                onClick={() => setTicketCount(prev => prev + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-md hover:bg-white/20 transition-all active:scale-90"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                        <span className={`font-bold text-lg ${item.highlight ? 'text-emerald-400 text-2xl' : ''}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const nextRule = [...raffle.mysteryBox.rules]
                      .sort((a, b) => a.minTickets - b.minTickets)
                      .find(r => r.minTickets > ticketCount);
                    
                    const allPrizesWon = raffle.mysteryBox.prizes.every(p => p.winnerOrderNumber !== null);

                    if (nextRule && !allPrizesWon) {
                      const ticketsMissing = nextRule.minTickets - ticketCount;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 space-y-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                              <Gift size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-black text-white uppercase tracking-tight">
                                {calculateBoxes(ticketCount) > 0 ? 'Quer ganhar mais Caixas?' : 'Ganhe uma Caixa Misteriosa!'}
                              </p>
                              <p className="text-[10px] text-purple-300 font-medium">
                                Faltam apenas <span className="font-black text-white">{ticketsMissing} bilhetes</span> para você levar <span className="text-white font-black">{nextRule.boxes} {nextRule.boxes === 1 ? 'caixa' : 'caixas'}</span>!
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setTicketCount(nextRule.minTickets)}
                            className="w-full bg-purple-500 hover:bg-purple-400 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Plus size={14} /> ADICIONAR +{ticketsMissing} BILHETES
                          </button>
                        </motion.div>
                      );
                    }
                    return null;
                  })()}
                  
                </div>
              </motion.div>

              <div className="space-y-4">
                <button
                  onClick={handlePay}
                  className="relative w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-6 rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <Smartphone size={24} />
                  <span className="tracking-[0.2em]">PAGAR COM PIX</span>
                </button>
                
                <button
                  onClick={handleBackToHome}
                  className="w-full text-gray-500 text-xs font-black hover:text-white transition-colors uppercase tracking-widest"
                >
                  ← Voltar e alterar pedido
                </button>
              </div>
            </main>
          </motion.div>
        )}

        {currentPage === 'payment' && !isAdmin && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-10 min-h-screen text-white pb-12"
          >
            {/* Header */}
            <header className="py-8 flex justify-center border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
              <div className="flex items-center gap-1">
                <span className="text-4xl font-black tracking-tighter font-display">Sav</span>
                <span className="text-4xl font-light tracking-widest text-emerald-400 font-display">/Awards</span>
              </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-12">
              <div className="bg-white/5 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/10 p-10 space-y-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                
                <div className="space-y-4">
                  <h2 className="font-black text-2xl leading-tight font-display">
                    QUASE LÁ! <br />
                    <span className="text-emerald-400 text-lg font-medium tracking-normal">Escaneie o QR Code abaixo</span>
                  </h2>
                  <p className="text-gray-400 text-xs max-w-xs mx-auto">
                    Abra seu app de banco, escolha <span className="text-white font-bold">Pix</span> e depois <span className="text-white font-bold">Ler QR Code</span>
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-6">
                  <div className="p-6 bg-white rounded-[32px] shadow-2xl shadow-emerald-500/10 relative group">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126350014BR.GOV.BCB.PIX0113SDFDFDFD-SF445204000053039865802BR5910dssfsfdsds6005sdsdf610845242-42462110507dsffff363041815"
                      alt="QR Code Pix"
                      className="w-56 h-56 relative z-10"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Valor a pagar</p>
                    <p className="text-4xl font-black text-emerald-400 font-display">
                      R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                    Ou utilize o <span className="text-white">Pix Copia e Cola</span>
                  </p>
                  
                  <div className="relative group">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-[10px] font-mono break-all text-gray-400 leading-relaxed pr-14 text-left">
                      00020126350014BR.GOV.BCB.PIX0113SDFDFDFD-SF445204000053039865802BR5910dssfsfdsds6005sdsdf610845242-42462110507dsffff363041815
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('00020126350014BR.GOV.BCB.PIX0113SDFDFDFD-SF445204000053039865802BR5910dssfsfdsds6005sdsdf610845242-42462110507dsffff363041815');
                      }}
                      className="absolute top-1/2 -translate-y-1/2 right-3 p-3 bg-emerald-500 text-white shadow-lg rounded-xl hover:bg-emerald-400 transition-all active:scale-90"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleBackToHome}
                  className="inline-flex items-center gap-2 text-emerald-400 font-black text-xs hover:text-emerald-300 transition-colors uppercase tracking-widest"
                >
                  <Check size={16} /> Já realizei o pagamento
                </button>
              </div>
            </main>
          </motion.div>
        )}

        {currentPage === 'tickets' && !isAdmin && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 min-h-screen text-white pb-12"
          >
            {/* Header */}
            <header className="py-8 flex justify-center border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
              <div className="flex items-center gap-1">
                <span className="text-4xl font-black tracking-tighter font-display">Sav</span>
                <span className="text-4xl font-light tracking-widest text-emerald-400 font-display">/Awards</span>
              </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black font-display">Meus Bilhetes</h2>
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Olá, {user?.name?.split(' ')[0] || ''}</p>
                </div>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="text-xs font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors"
                >
                  ← Voltar
                </button>
              </div>

              <div className="space-y-6">
                {MOCK_TICKETS.filter(t => t.cpf === user?.cpf).map((ticket, idx) => {
                  const isExpanded = expandedTickets.includes(ticket.orderNumber);
                  return (
                    <motion.div 
                      key={ticket.orderNumber}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden group hover:border-emerald-500/30 transition-all"
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-white/10 p-1.5 rounded-lg">
                                <Hash size={12} className="text-emerald-400" />
                              </div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedido #{ticket.orderNumber}</p>
                            </div>
                            <p className="text-sm font-black text-white uppercase tracking-tight">{ticket.raffleTitle}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Comprado em {new Date(ticket.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                              {ticket.status}
                            </div>
                            <button 
                              onClick={() => {
                                if (isExpanded) {
                                  setExpandedTickets(expandedTickets.filter(id => id !== ticket.orderNumber));
                                } else {
                                  setExpandedTickets([...expandedTickets, ticket.orderNumber]);
                                }
                              }}
                              className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors"
                            >
                              {isExpanded ? 'Recolher' : 'Ver Números'}
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 border-t border-white/5 space-y-6">
                                {/* Mystery Boxes Section */}
                                {raffle.mysteryBox.enabled && ticket.status === 'pago' && (getEarnedBoxesCount(ticket.numbers.length) > 0 || (ticket.openedBoxes && ticket.openedBoxes.length > 0)) && (
                                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Gift size={16} className="text-purple-400" />
                                        <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Suas Caixas Misteriosas</p>
                                      </div>
                                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        {ticket.openedBoxes?.length || 0} / {getEarnedBoxesCount(ticket.numbers.length)} Abertas
                                      </p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                      {Array.from({ length: getEarnedBoxesCount(ticket.numbers.length) }).map((_, bIdx) => {
                                        const openedBox = ticket.openedBoxes?.find((b: any) => b.index === bIdx);
                                        const isOpened = !!openedBox;
                                        const allPrizesWon = raffle.mysteryBox.prizes.every(p => p.winnerOrderNumber !== null);
                                        
                                          return (
                                            <div key={bIdx} className="space-y-2 text-center">
                                              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Caixa #{bIdx + 1}</p>
                                              <button
                                                disabled={isOpened || allPrizesWon}
                                                onClick={() => handleOpenBox(ticket)}
                                                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                                                  isOpened 
                                                    ? openedBox.prize 
                                                      ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
                                                      : 'bg-white/5 border border-white/10 text-gray-600' 
                                                    : allPrizesWon
                                                      ? 'bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed'
                                                      : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-110'
                                                }`}
                                              >
                                                {isOpened ? openedBox.prize ? <Trophy size={20} /> : <X size={20} /> : <Gift size={20} />}
                                                {!isOpened && !allPrizesWon && (
                                                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                                                  </span>
                                                )}
                                              </button>
                                              {isOpened ? (
                                                <p className={`text-[8px] font-black uppercase tracking-tighter ${openedBox.prize ? 'text-yellow-400' : 'text-gray-600'}`}>
                                                  {openedBox.prize ? 'Ganhou!' : 'Nada'}
                                                </p>
                                              ) : allPrizesWon ? (
                                                <p className="text-[8px] font-black text-red-400 uppercase tracking-tighter">Esgotado</p>
                                              ) : null}
                                            </div>
                                          );
                                      })}
                                    </div>
                                    {ticket.openedBoxes?.some((b: any) => b.prize) && (
                                      <div className="pt-3 border-t border-purple-500/10">
                                        <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                                          <Sparkles size={12} /> Prêmios ganhos:
                                        </p>
                                        <div className="mt-2 space-y-1">
                                          {ticket.openedBoxes.filter((b: any) => b.prize).map((b: any, idx: number) => (
                                            <p key={idx} className="text-[10px] text-white font-bold">{b.prize}</p>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="space-y-3">
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Seus números da sorte:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {ticket.numbers.map((num, nIdx) => (
                                      <div key={nIdx} className="bg-white/10 px-3 py-2 rounded-xl font-mono text-sm font-bold border border-white/5 group-hover:border-emerald-500/20 transition-colors text-emerald-400">
                                        {num}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}

                {MOCK_TICKETS.filter(t => t.cpf === user?.cpf).length === 0 && (
                  <div className="text-center py-20 space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Nenhum bilhete encontrado</p>
                    <button 
                      onClick={() => setCurrentPage('home')}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all"
                    >
                      Comprar agora
                    </button>
                  </div>
                )}
              </div>
            </main>
          </motion.div>
        )}

        {isAdmin && (
          <AdminPanel 
            setIsAdmin={setIsAdmin}
            raffle={raffle}
            setRaffle={setRaffle}
            tickets={MOCK_TICKETS}
            contributors={MOCK_CONTRIBUTORS}
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#1e293b] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black font-display">Finalizar Reserva</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {!isNewUser && isNewUser !== null ? (
                  // Existing User
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
                      <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Usuário Encontrado</p>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-400">Nome:</p>
                        <p className="font-black text-lg">{maskName(user.name)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-400">Telefone:</p>
                        <p className="font-black text-lg">{maskPhone(user.phone)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleConfirm}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                      >
                        CONFIRMAR
                      </button>
                      <button
                        onClick={() => {
                          setIsNewUser(null);
                          setCpf('');
                          setCpfError('');
                        }}
                        className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black py-3 rounded-2xl transition-all text-xs uppercase tracking-widest"
                      >
                        Não é você?
                      </button>
                    </div>
                  </div>
                ) : isNewUser === true ? (
                  // New User Form
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-1">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">CPF Informado</p>
                      <p className="font-black text-lg">{cpf}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nome Completo</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Digite seu nome completo"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="seu@email.com"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Data de Nascimento</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Telefone</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handlePhoneChange(e, 'phone')}
                            placeholder="(00) 00000-0000"
                            className={`w-full bg-white/5 border ${phoneError ? 'border-red-500' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Confirmar Telefone</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input
                            type="tel"
                            value={formData.confirmPhone}
                            onChange={(e) => handlePhoneChange(e, 'confirmPhone')}
                            placeholder="(00) 00000-0000"
                            className={`w-full bg-white/5 border ${phoneError ? 'border-red-500' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                          />
                        </div>
                      </div>
                      {phoneError && (
                        <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">{phoneError}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                      <button
                        onClick={handleConfirm}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                      >
                        CONFIRMAR
                      </button>
                      <button
                        onClick={() => {
                          setIsNewUser(null);
                          setCpf('');
                          setCpfError('');
                        }}
                        className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black py-3 rounded-2xl transition-all text-xs uppercase tracking-widest"
                      >
                        Não é você?
                      </button>
                    </div>
                  </div>
                ) : (
                  // CPF Input
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Informe seu CPF</label>
                      <input
                        type="text"
                        value={cpf}
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={`w-full bg-white/5 border ${cpfError ? 'border-red-500' : 'border-white/10'} rounded-2xl px-4 py-4 text-center text-xl font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                      />
                      {cpfError && (
                        <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">{cpfError}</p>
                      )}
                    </div>
                    <button
                      onClick={handleCpfSubmit}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                    >
                      CONTINUAR
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#1e293b] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black font-display">Buscar Bilhetes</h3>
                  <button onClick={() => setIsLoginModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {isLoginStepPhone ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
                      <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Usuário Encontrado</p>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-400">Nome:</p>
                        <p className="font-black text-lg">{maskName(loginUser.name)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Confirme seu Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="tel"
                          value={loginPhone}
                          onChange={handleLoginPhoneChange}
                          placeholder="(00) 00000-0000"
                          className={`w-full bg-white/5 border ${loginPhoneError ? 'border-red-500' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold`}
                        />
                      </div>
                      {loginPhoneError && (
                        <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">{loginPhoneError}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleLoginPhoneSubmit}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                      >
                        VER MEUS BILHETES
                      </button>
                      <button
                        onClick={() => {
                          setIsLoginStepPhone(false);
                          setLoginPhone('');
                          setLoginPhoneError('');
                        }}
                        className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black py-3 rounded-2xl transition-all text-xs uppercase tracking-widest"
                      >
                        Não é você?
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Informe seu CPF</label>
                      <input
                        type="text"
                        value={loginCpf}
                        onChange={handleLoginCpfChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={`w-full bg-white/5 border ${loginCpfError ? 'border-red-500' : 'border-white/10'} rounded-2xl px-4 py-4 text-center text-xl font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                      />
                      {loginCpfError && (
                        <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">{loginCpfError}</p>
                      )}
                    </div>
                    <button
                      onClick={handleLoginCpfSubmit}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                    >
                      CONTINUAR
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mystery Box Modal */}
      <AnimatePresence>
        {isMysteryBoxModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-purple-500/30 rounded-[40px] shadow-2xl overflow-hidden p-8 text-center space-y-8"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
              
              {boxOpeningStatus === 'opening' ? (
                <div className="py-12 space-y-8">
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1, 1.1, 1]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="flex justify-center"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[40px] flex items-center justify-center shadow-2xl shadow-purple-500/40">
                      <Gift size={64} className="text-white" />
                    </div>
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black font-display tracking-tight animate-pulse">ABRINDO CAIXA...</h3>
                    <p className="text-purple-300 text-xs font-bold uppercase tracking-widest">Sorteando seu prêmio</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex justify-center"
                  >
                    {boxPrize ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400/20 blur-3xl animate-pulse" />
                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[40px] flex items-center justify-center shadow-2xl shadow-yellow-500/40 relative z-10">
                          <Trophy size={64} className="text-white" />
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute -top-4 -right-4"
                        >
                          <Sparkles className="text-yellow-400" size={32} />
                        </motion.div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-[40px] flex items-center justify-center">
                        <X size={64} className="text-gray-600" />
                      </div>
                    )}
                  </motion.div>

                  <div className="space-y-4">
                    {boxPrize ? (
                      <>
                        <div className="space-y-1">
                          <h3 className="text-3xl font-black font-display tracking-tight text-white">PARABÉNS!</h3>
                          <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Você ganhou um prêmio instantâneo</p>
                        </div>
                        <div className="bg-white/5 border border-yellow-500/30 rounded-2xl p-6">
                          <p className="text-2xl font-black text-white font-display">{boxPrize}</p>
                        </div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-widest">O prêmio será creditado em sua conta em breve</p>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <h3 className="text-3xl font-black font-display tracking-tight text-white">NÃO FOI DESSA VEZ</h3>
                          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Tente na próxima</p>
                        </div>
                        <p className="text-gray-400 text-sm">Continue participando para ter mais chances de ganhar!</p>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setIsMysteryBoxModalOpen(false)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs"
                  >
                    FECHAR
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
