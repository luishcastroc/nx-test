import { Mode, Ticket, TicketDetail, User } from '@acme/shared-models';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Navigate } from '@ngxs/router-plugin';
import { Select, Store } from '@ngxs/store';
import {
  combineLatest,
  map,
  Observable,
  startWith,
  Subject,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

import {
  ChangeMode,
  GetTickets,
  GetUsers,
  SortTickets,
  TicketsState,
} from '../../../data';

@Component({
  selector: 'acme-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy {
  @Select(TicketsState.users) users$!: Observable<User[]>;

  @Select(TicketsState.getMode) mode$!: Observable<Mode>;
  @Select(TicketsState.getTicketsWithDetails)
  ticketsWithDetails$!: Observable<TicketDetail[]>;
  searchResults$!: Observable<TicketDetail[]>;
  filterForm!: FormGroup;
  tickets$!: Observable<Ticket[]>;
  searchBar = new FormControl();

  private _unsubscribeAll: Subject<null> = new Subject<null>();

  constructor(private _store: Store, private _formBuilder: FormBuilder) {}

  get filter() {
    return this.filterForm.get('status') as FormControl;
  }

  ngOnInit(): void {
    this._store.dispatch([new GetUsers(), new GetTickets()]);
    this.filterForm = this._formBuilder.group({
      status: ['none'],
    });

    this.filter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value) => {
        this._store.dispatch(new SortTickets(value));
      }); 

    this.searchResults$ = combineLatest([
      this.searchBar.valueChanges.pipe(startWith('')),
      this.ticketsWithDetails$,
    ]).pipe(
      map(([value, tickets]) => this._filter(value, tickets))
    );
  }

  goToTicket(id: number): void {
    this._store.dispatch(new Navigate([`/details/${id}`]));
  }

  addTicket(): void {
    this._store.dispatch(new ChangeMode('add'));
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private _filter(value: string, tickets: TicketDetail[]): TicketDetail[] {
    if (!value || value === '') {
      return tickets;
    }
    //getting the value from the input
    const filterValue = value.toLowerCase();

    // returning the filtered array
    return tickets.filter((ticket) =>
      ticket.description.toLowerCase().includes(filterValue)
    );
  }
}
