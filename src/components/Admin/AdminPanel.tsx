"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { Raffle, Ticket, Contributor } from '@/lib/types';

interface AdminPanelProps {
  setIsAdmin: (val: boolean) => void;
  raffle: Raffle;
  setRaffle: (raffle: Raffle) => void;
  tickets: Ticket[];
  contributors: Contributor[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  setIsAdmin,
  raffle,
  setRaffle,
  tickets,
  contributors
}) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'stats' | 'config' | 'buyers' | 'micro'>('stats');
  const [rankingFilter, setRankingFilter] = useState<'geral' | 'diaria' | 'semanal' | 'mensal'>('geral');
  const [rankingDate, setRankingDate] = useState(new Date().toISOString().split('T')[0]);

  const [microWinner, setMicroWinner] = useState<{ name: string; prize: string } | null>(null);
  const [isRaffling, setIsRaffling] = useState(false);
  const [microPrizeInput, setMicroPrizeInput] = useState('');
  const [microStartTime, setMicroStartTime] = useState('');
  const [microEndTime, setMicroEndTime] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'admin123') {
      setIsAdminAuthenticated(true);
      setAdminError('');
    } else {
      setAdminError('Usuário ou senha incorretos');
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setAdminUsername('');
    setAdminPassword('');
    setIsAdmin(false);
  };

  const handleRunMicroRaffle = (type: 'random' | 'time') => {
    if (!microPrizeInput) {
      alert('Por favor, informe o prêmio do sorteio.');
      return;
    }

    setIsRaffling(true);
    setMicroWinner(null);

    setTimeout(() => {
      const winners = ['Murilo Souza', 'Ana Clara', 'Roberto Silva', 'Juliana Lima'];
      const randomWinner = winners[Math.floor(Math.random() * winners.length)];
      setMicroWinner({ name: randomWinner, prize: microPrizeInput });
      setIsRaffling(false);
    }, 3000);
  };

  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="relative z-10 min-h-screen bg-[#0f172a] pb-20"
    >
      {!isAdminAuthenticated ? (
        <AdminLogin
          adminUsername={adminUsername}
          setAdminUsername={setAdminUsername}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          adminError={adminError}
          handleAdminLogin={handleAdminLogin}
          setIsAdmin={setIsAdmin}
        />
      ) : (
        <AdminDashboard
          isAdminAuthenticated={isAdminAuthenticated}
          setIsAdminAuthenticated={setIsAdminAuthenticated}
          adminUsername={adminUsername}
          setAdminUsername={setAdminUsername}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          adminError={adminError}
          handleAdminLogin={handleAdminLogin}
          setIsAdmin={setIsAdmin}
          raffle={raffle}
          setRaffle={setRaffle}
          tickets={tickets}
          contributors={contributors}
          handleLogoutAdmin={handleLogoutAdmin}
          activeAdminTab={activeAdminTab}
          setActiveAdminTab={setActiveAdminTab}
          rankingFilter={rankingFilter}
          setRankingFilter={setRankingFilter}
          rankingDate={rankingDate}
          setRankingDate={setRankingDate}
          microWinner={microWinner}
          setMicroWinner={setMicroWinner}
          isRaffling={isRaffling}
          setIsRaffling={setIsRaffling}
          microPrizeInput={microPrizeInput}
          setMicroPrizeInput={setMicroPrizeInput}
          microStartTime={microStartTime}
          setMicroStartTime={setMicroStartTime}
          microEndTime={microEndTime}
          setMicroEndTime={setMicroEndTime}
          handleRunMicroRaffle={handleRunMicroRaffle}
        />
      )}
    </motion.div>
  );
};