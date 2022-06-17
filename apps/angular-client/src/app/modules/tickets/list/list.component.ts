import { Mode, Ticket, User } from '@acme/shared-models';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Navigate } from '@ngxs/router-plugin';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ChangeMode, GetTickets, GetUsers, SortTickets, TicketsState } from '../../../data';

@Component({
  selector: 'acme-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy {
  @Select(TicketsState.users) users$!: Observable<User[]>;
  @Select(TicketsState.sortedTickets) sortedTickets$!: Observable<Ticket[]>;
  @Select(TicketsState.getMode) mode$!: Observable<Mode>;
  filterForm!: FormGroup;
  tickets$!: Observable<Ticket[]>;

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
}
