import { Ticket } from './types';

export const getWinnerNameByOrderNumber = (orderNumber: string | null, tickets: Ticket[]) => {
  if (!orderNumber) return null;
  const ticket = tickets.find(t => t.orderNumber === orderNumber);
  return ticket ? ticket.name : 'Desconhecido';
};

export const maskName = (name: string) => {
  if (!name) return '';
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length === 0) return '';
  
  const prepositions = ['de', 'da', 'do', 'dos', 'das', 'e'];
  const firstName = parts[0];
  
  if (parts.length === 1) return firstName;
  
  let secondPartIndex = 1;
  let displayName = firstName;

  if (prepositions.includes(parts[1].toLowerCase()) && parts.length > 2) {
    displayName += ' ' + parts[1];
    secondPartIndex = 2;
  }

  const secondPart = parts[secondPartIndex];
  if (secondPart) {
    displayName += ' ' + secondPart[0] + '...';
  }
  
  return displayName;
};

export const maskPhone = (phone: string) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `(${digits.substring(0, 2)}) *****-${digits.substring(digits.length - 4)}`;
};
