export type Page = 'home' | 'checkout' | 'payment';

export interface TicketSelection {
  quantity: number;
  pricePerTicket: number;
}
