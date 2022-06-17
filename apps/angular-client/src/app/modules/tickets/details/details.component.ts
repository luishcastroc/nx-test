import { Mode, TicketDetail, User } from '@acme/shared-models';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Navigate } from '@ngxs/router-plugin';
import { Actions, ofActionCompleted, Select, Store } from '@ngxs/store';
import { map, mergeMap, Observable, Subject, takeUntil, tap } from 'rxjs';

import { Assign, ChangeMode, Complete, TicketsState } from '../../../data';

@Component({
  selector: 'acme-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  @Select(TicketsState.loading) loading$!: Observable<boolean>;
  @Select(TicketsState.users) users$!: Observable<User[]>;
  @Select(TicketsState.getMode) mode$!: Observable<Mode>;
  ticketDetails$!: Observable<TicketDetail | null>;
  detailForm!: FormGroup;
  message!: string | undefined;
  loadingMessage!: string | undefined;

  private _unsubscribeAll: Subject<null> = new Subject<null>();

  constructor(
    private _store: Store,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _actions$: Actions,
    private _cdr: ChangeDetectorRef
  ) {}

  get ticketId() {
    return this.detailForm.get('id') as FormControl;
  }
  get assigneeId() {
    return this.detailForm.get('assigneeId') as FormControl;
  }
  get newAssigneeId() {
    return this.detailForm.get('newAssigneeId') as FormControl;
  }

  ngOnInit(): void {
    this.detailForm = this._formBuilder.group({
      id: [],
      description: ['', Validators.required],
      assigneeId: [''],
      newAssigneeId: [null],
      completed: [false],
    });

    this.ticketDetails$ = this._route.paramMap.pipe(
      mergeMap((paramMap) => {
        return this._store
          .select(TicketsState.getTicketDetails)
          .pipe(map((filterFn) => filterFn(paramMap.get('id') as string)));
      }),
      tap((detail) => {
        if (detail) {
          const { id, description, assigneeId, completed } = detail;
          this.detailForm.patchValue({
            id,
            description,
            assigneeId,            
            completed:completed,
          });
        }
      })
    );

    this._actions$
      .pipe(
        takeUntil(this._unsubscribeAll),
        ofActionCompleted(Complete, Assign)
      )
      .subscribe((result) => {
        const { error, successful } = result.result;
        const { action } = result;
        if (error) {
          this.message = `${(error as HttpErrorResponse)['error'].message}`;
        }
        if (successful) {
          if (action instanceof Complete) {
            this.message = 'Ticket Completed succesfully...';
          }
          if (action instanceof Assign) {
            this.message = 'Ticket assigned succesfully...';
            this._store.dispatch(new ChangeMode('list'));
          }
          this._cdr.markForCheck();
          setTimeout(() => {
            this.message = undefined;
            this._cdr.markForCheck();
          }, 3000);
          //          this.ticketsForm.reset();
        }
        //      this.ticketsForm.enable();
      });
  }

  back(): void {
    this._store.dispatch(new Navigate(['/']));
  }

  assign(): void {
    this.loadingMessage = `Assigning ticket with ID: ${this.detailForm.get('id')?.value}...`;
    this._store.dispatch(new ChangeMode('edit'));
  }

  cancel(): void {
    this._store.dispatch(new ChangeMode('list'));
  }

  save(): void {
    this._store.dispatch(
      new Assign(+this.ticketId.value, +this.newAssigneeId.value)
    );
  }

  complete(ticketId: number): void {
    this.loadingMessage = `Completing ticket with ID: ${ticketId}...`;
    this._store.dispatch(new Complete(ticketId));
  }

  ngOnDestroy(): void {
    this._store.dispatch(new ChangeMode('list'));
  }
}
