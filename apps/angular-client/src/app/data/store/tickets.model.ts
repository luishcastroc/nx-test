import { Mode, Ticket, User } from '@acme/shared-models';

export interface TicketsStateModel {
  users: User[] | undefined;
  tickets: Ticket[] | undefined;
  sortedTickets: Ticket[] | undefined;
  loading: boolean;
  mode: Mode;
}
