export type User = {
  id: number;
  name: string;
};

export type Ticket = {
  id: number;
  description: string;
  assigneeId: null | number;
  completed: boolean;
};


export type TicketDetail  = Ticket & {user: User | null};

export type Mode = 'add' | 'edit' | 'list';