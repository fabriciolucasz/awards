/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MessageCircle, Send, Instagram, Smartphone, Copy, Minus, Plus, Check, ChevronRight, Trophy, Users, Info, X, Calendar, Phone, ChevronDown, ChevronUp, Hash, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Database ---
const MOCK_USERS = [
  {
    cpf: '07163165102',
    name: 'Murilo de Oliveira Souza',
    phone: '11987654321',
    birthDate: '1995-05-15'
  },
  {
    cpf: '98765432100',
    name: 'Vagner Alberto Monteiro',
    phone: '11912345678',
    birthDate: '1988-10-20'
  }
];

const MOCK_RAFFLE = {
  id: 'raffle-001',
  title: 'TITAN 160 (10 mil no PIX)',
  description: 'O vencedor será definido no primeiro prêmio da loteria federal!',
  pricePerTicket: 0.05,
  minTickets: 100,
  imageUrl: 'https://www.trgustavin.com.br/play/views/theme/trgustavin/assets/img/acao/titan.png',
  organizer: {
    name: 'TRGUSTAVIN',
    avatarUrl: 'https://picsum.photos/seed/organizer/100/100',
    supportUrl: '#',
    telegramUrl: '#',
    instagramUrl: '#'
  },
  extraPrize: {
    description: 'O que comprar mais números leva o prêmio extra de:',
    value: 300.00
  },
  mysteryBox: {
    enabled: true,
    rules: [
      { minTickets: 400, boxes: 1 },
      { minTickets: 600, boxes: 2 },
      { minTickets: 1200, boxes: 6 }
    ],
    winProbability: 0.99, // 10% chance to win
    prizes: ['R$ 50,00 no PIX', 'R$ 100,00 no PIX', '1000 Bilhetes Grátis']
  }
};

const MOCK_CONTRIBUTORS = [
  { rank: 1, name: 'Murilo Oliveira Souza', ticketCount: 5000, color: 'bg-yellow-500' },
  { rank: 2, name: 'Vagner Alberto Monteiro', ticketCount: 3000, color: 'bg-slate-300' },
  { rank: 3, name: 'Jeniffer Pereira Martins', ticketCount: 1000, color: 'bg-orange-400' }
];

const MOCK_TICKETS = [
  { orderNumber: '240220-001', cpf: '07163165102', numbers: Array.from({ length: 400 }, (_, i) => (10000 + i).toString()), date: '2024-02-20', status: 'pago', raffleTitle: 'TITAN 160 (10 mil no PIX)', openedBoxes: [] },
  { orderNumber: '240221-002', cpf: '98765432100', numbers: ['55443', '22110'], date: '2024-02-21', status: 'pago', raffleTitle: 'TITAN 160 (10 mil no PIX)', openedBoxes: [] },
  { orderNumber: '240222-003', cpf: '07163165102', numbers: Array.from({ length: 1200 }, (_, i) => (20000 + i).toString()), date: '2024-02-22', status: 'pago', raffleTitle: 'TITAN 160 (10 mil no PIX)', openedBoxes: [] }
];
// ----------------------

type Page = 'home' | 'checkout' | 'payment' | 'tickets';

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
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [ticketCount, setTicketCount] = useState(MOCK_RAFFLE.minTickets);
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
    birthDate: '',
    phone: '',
    confirmPhone: ''
  });

  const maskName = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '';
    
    const prepositions = ['de', 'da', 'do', 'dos', 'das', 'e'];
    const firstName = parts[0];
    
    if (parts.length === 1) return firstName;
    
    let secondPartIndex = 1;
    let displayName = firstName;

    // If the second part is a preposition, include it and move to the next part
    if (prepositions.includes(parts[1].toLowerCase()) && parts.length > 2) {
      displayName += ` ${parts[1]}`;
      secondPartIndex = 2;
    }

    const secondName = parts[secondPartIndex];
    
    // Mask the meaningful second name: show first 2 chars, mask the rest
    const maskedSecond = secondName.length > 2 
      ? secondName.substring(0, 2) + '*'.repeat(Math.min(secondName.length - 2, 8))
      : secondName;
      
    return `${displayName} ${maskedSecond}`;
  };

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

  const maskPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned[2]}****-**${cleaned.substring(9)}`;
    }
    return phone;
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

  const calculateBoxes = (ticketCount: number) => {
    const rules = [...MOCK_RAFFLE.mysteryBox.rules].sort((a, b) => b.minTickets - a.minTickets);
    const rule = rules.find(r => ticketCount >= r.minTickets);
    return rule ? rule.boxes : 0;
  };

  const handleOpenBox = (ticket: any) => {
    setCurrentBoxTicket(ticket);
    setBoxOpeningStatus('opening');
    setIsMysteryBoxModalOpen(true);
    
    // Simulate opening animation
    setTimeout(() => {
      const win = Math.random() < MOCK_RAFFLE.mysteryBox.winProbability;
      if (win) {
        const prize = MOCK_RAFFLE.mysteryBox.prizes[Math.floor(Math.random() * MOCK_RAFFLE.mysteryBox.prizes.length)];
        setBoxPrize(prize);
      } else {
        setBoxPrize(null);
      }
      setBoxOpeningStatus('opened');
      
      // Update ticket in mock database (local state only for demo)
      if (!ticket.openedBoxes) ticket.openedBoxes = [];
      ticket.openedBoxes.push(ticket.openedBoxes.length);
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
        {currentPage === 'home' && (
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
                  src={MOCK_RAFFLE.imageUrl}
                  alt={MOCK_RAFFLE.title}
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
                    POR APENAS <span className="text-white">R$ {MOCK_RAFFLE.pricePerTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants} className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight font-display leading-tight">
                  {MOCK_RAFFLE.title.split('(')[0]} <br />
                  <span className="text-emerald-400">({MOCK_RAFFLE.title.split('(')[1]}</span>
                </h1>
                <div className="h-1 w-20 bg-emerald-500 rounded-full" />
              </motion.div>

              {/* Organizer */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={MOCK_RAFFLE.organizer.avatarUrl}
                      alt={MOCK_RAFFLE.organizer.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-[#0f172a]">
                      <Check size={10} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Organizado por</p>
                    <p className="font-black text-base font-display">{MOCK_RAFFLE.organizer.name}</p>
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
                    {MOCK_RAFFLE.description}
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                    {MOCK_RAFFLE.extraPrize.description} <span className="font-black text-emerald-400 ml-1">R$ {MOCK_RAFFLE.extraPrize.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
              </motion.section>

              {/* Mystery Box Promo Card */}
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
                  {MOCK_RAFFLE.mysteryBox.rules.map((rule, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center space-y-1 group-hover:border-purple-500/30 transition-all">
                      <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">{rule.minTickets} Números</p>
                      <p className="text-lg font-black text-white">{rule.boxes} {rule.boxes === 1 ? 'Caixa' : 'Caixas'}</p>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Ranking */}
              <motion.section variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-8">
                <h2 className="text-center text-xs font-black tracking-[0.2em] text-gray-400 uppercase flex items-center justify-center gap-2">
                  <Users size={14} /> Classificação dos Colaboradores
                </h2>
                <div className="grid grid-cols-3 gap-6">
                  {MOCK_CONTRIBUTORS.map((user) => (
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

              {/* Ticket Selection */}
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
                    onClick={() => setTicketCount(prev => Math.max(MOCK_RAFFLE.minTickets, prev - 1))}
                    className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-90"
                  >
                    <Minus size={20} />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.max(MOCK_RAFFLE.minTickets, parseInt(e.target.value) || MOCK_RAFFLE.minTickets))}
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
                  Mínimo de <span className="text-emerald-400">{MOCK_RAFFLE.minTickets}</span> bilhetes
                </p>

                <div className="flex justify-between items-end pt-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Valor total do investimento</span>
                    <div className="text-3xl font-black text-emerald-400 font-display">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <button
                  onClick={handleReserve}
                  className="relative w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-5 rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative tracking-[0.2em]">RESERVAR AGORA</span>
                </button>
              </motion.section>

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
                      { label: 'Quantidade de bilhetes', value: ticketCount }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1 border-b border-white/5 pb-4">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                        <span className="font-bold text-lg">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  
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

        {currentPage === 'payment' && (
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

        {currentPage === 'tickets' && (
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
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Olá, {user?.name.split(' ')[0]}</p>
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
                                {ticket.status === 'pago' && calculateBoxes(ticket.numbers.length) > 0 && (
                                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Gift size={16} className="text-purple-400" />
                                        <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Suas Caixas Misteriosas</p>
                                      </div>
                                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        {ticket.openedBoxes?.length || 0} / {calculateBoxes(ticket.numbers.length)} Abertas
                                      </p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                      {Array.from({ length: calculateBoxes(ticket.numbers.length) }).map((_, bIdx) => {
                                        const isOpened = ticket.openedBoxes?.includes(bIdx);
                                        return (
                                          <button
                                            key={bIdx}
                                            disabled={isOpened}
                                            onClick={() => handleOpenBox(ticket)}
                                            className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                                              isOpened 
                                                ? 'bg-white/5 border border-white/10 text-gray-600' 
                                                : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-110'
                                            }`}
                                          >
                                            <Gift size={20} />
                                            {!isOpened && (
                                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                                              </span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
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
                        <input
                          type="tel"
                          value={formData.confirmPhone}
                          onChange={(e) => handlePhoneChange(e, 'confirmPhone')}
                          placeholder="(00) 00000-0000"
                          className={`w-full bg-white/5 border ${phoneError ? 'border-red-500' : 'border-white/10'} rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                        />
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
    </div>
  );
}
