export type Page = 'home' | 'checkout' | 'payment' | 'tickets' | 'admin';

export interface Raffle {
  id: string;
  title: string;
  description: string;
  pricePerTicket: number;
  minTickets: number;
  totalTickets: number;
  imageUrl: string;
  status: 'active' | 'finished';
  endDate: string;
  winner: string | null;
  salesBlocked: boolean;
  rankingEnabled: boolean;
  top3Prizes: string[];
  organizer: {
    name: string;
    avatarUrl: string;
    supportUrl: string;
    telegramUrl: string;
    instagramUrl: string;
  };
  extraPrize: {
    description: string;
    value: number;
  };
  mysteryBox: {
    enabled: boolean;
    rules: { minTickets: number; boxes: number }[];
    winProbability: number;
    prizes: { id: number; name: string; winnerOrderNumber: string | null; probability: number | null }[];
  };
}

export interface User {
  cpf: string;
  name: string;
  phone: string;
  birthDate: string;
  email?: string;
}

export interface Contributor {
  rank: number;
  name: string;
  ticketCount: number;
  color: string;
  category: string;
}

export interface Ticket {
  orderNumber: string;
  name: string;
  phone: string;
  cpf: string;
  numbers: string[];
  date: string;
  status: string;
  raffleTitle: string;
  openedBoxes: { index: number; id: number; prize: string | null }[];
}
