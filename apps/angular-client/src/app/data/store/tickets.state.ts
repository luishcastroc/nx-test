import { ApiService } from '../services/api.service';
import { Mode, Ticket, TicketDetail, User } from '@acme/shared-models';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import {
  Add,
  Assign,
  ChangeMode,
  Complete,
  GetTickets,
  GetUsers,
  SortTickets,
} from './tickets.actions';
import { TicketsStateModel } from './tickets.model';

@State<TicketsStateModel>({
  name: 'tickets',
  defaults: {
    tickets: undefined,
    users: undefined,
    sortedTickets: undefined,
    loading: false,
    mode: 'list',
  },
})
@Injectable()
export class TicketsState {
  constructor(private apiService: ApiService) {}

  @Selector()
  static tickets({ tickets }: TicketsStateModel): Ticket[] | undefined {
    return tickets;
  }

  @Selector()
  static sortedTickets({
    sortedTickets,
  }: TicketsStateModel): Ticket[] | undefined {
    return sortedTickets;
  }

  @Selector()
  static users({ users }: TicketsStateModel): User[] | undefined {
    return users;
  }

  @Selector()
  static getFilteredTicketsFn({ tickets }: TicketsStateModel) {
    return (status: boolean) =>
      tickets?.filter((ticket) => ticket.completed === status);
  }

  @Selector()
  static loading({ loading }: TicketsStateModel): boolean {
    return loading;
  }

  @Selector()
  static getMode({ mode }: TicketsStateModel): Mode {
    return mode;
  }

  @Selector()
  static getTicketDetails({ users, tickets }: TicketsStateModel) {
    return (ticketId: string): TicketDetail | null => {
      const ticket = tickets?.filter((ticket) => ticket.id === +ticketId);
      if (ticket && ticket.length > 0) {
        const user = users?.filter((user) => user.id === ticket[0].assigneeId);
        if (user) {
          return { ...ticket[0], user: { ...user[0] } };
        } else {
          return { ...ticket[0], user: null };
        }
      } else {
        return null;
      }
    };
  }

  @Action(GetUsers)
  getUsers(ctx: StateContext<TicketsStateModel>) {
    return this.apiService.users().pipe(
      tap((users: User[]) => {
        if (users) {
          ctx.patchState({ users });
        }
      })
    );
  }

  @Action(GetTickets)
  getTickets(ctx: StateContext<TicketsStateModel>) {
    return this.apiService.tickets().pipe(
      tap((tickets: Ticket[]) => {
        if (tickets) {
          ctx.patchState({ tickets });
          ctx.dispatch(new SortTickets('none'));
        }
      })
    );
  }

  @Action(Add)
  addTicket(ctx: StateContext<TicketsStateModel>, { description }: Add) {
    ctx.patchState({ loading: true });
    return this.apiService.newTicket({ description }).pipe(
      tap((ticket: Ticket) => {
        if (ticket) {
          const state = ctx.getState();
          if (state.tickets) {
            const tickets = [...state.tickets];
            tickets.push(ticket);

            ctx.patchState({ tickets, loading: false });
            ctx.dispatch(new SortTickets('none'));
          }
        }
      })
    );
  }

  @Action(Assign)
  assignTicket(
    ctx: StateContext<TicketsStateModel>,
    { ticketId, userId }: Assign
  ) {
    ctx.patchState({loading:true});
    return this.apiService.assign(ticketId, userId).pipe(
      tap(() => {
        const state = ctx.getState();
        if (state.tickets) {
          const tickets = [...state.tickets];
          const idx = tickets.findIndex((ticket) => ticket.id === ticketId);
          tickets[idx] = { ...tickets[idx], assigneeId: userId };

          ctx.patchState({ tickets,loading:false });
          ctx.dispatch(new SortTickets('none'));
        }
      })
    );
  }

  @Action(Complete)
  completeTicket(ctx: StateContext<TicketsStateModel>, { ticketId }: Complete) {
    return this.apiService.complete(ticketId, true).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({ loading: true });
        if (state.tickets) {
          const tickets = [...state.tickets];
          const idx = tickets.findIndex((ticket) => ticket.id === ticketId);
          tickets[idx] = { ...tickets[idx], completed: true };

          ctx.patchState({ tickets, loading: false });
        }
      })
    );
  }

  @Action(SortTickets)
  sortTickets(ctx: StateContext<TicketsStateModel>, { sortBy }: SortTickets) {
    let sortedTickets: Ticket[];
    const { tickets } = ctx.getState();
    if (tickets) {
      if (sortBy === 'completed') {
        sortedTickets = tickets.filter((ticket) => ticket.completed);
      } else if (sortBy === 'not-completed') {
        sortedTickets = tickets.filter((ticket) => !ticket.completed);
      } else {
        sortedTickets = tickets;
      }
      ctx.patchState({ sortedTickets });
    }
  }

  @Action(ChangeMode)
  changeMode(ctx: StateContext<TicketsStateModel>, { mode }: ChangeMode) {
    ctx.patchState({ mode });
  }
}
