import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Actions, ofActionCompleted, Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { Add, ChangeMode, TicketsState } from '../../../data';

@Component({
  selector: 'acme-add-ticket',
  templateUrl: './add-ticket.component.html',
  styleUrls: ['./add-ticket.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTicketComponent implements OnInit, OnDestroy {
  @Select(TicketsState.loading) loading$!:Observable<boolean>;
  ticketsForm!: FormGroup;
  message!: string | undefined;

  private _unsubscribeAll: Subject<null> = new Subject<null>();

  constructor(
    private _store: Store,
    private _formBuilder: FormBuilder,
    private _actions$: Actions,
    private _cdr: ChangeDetectorRef
  ) {}

  get description() {
    return this.ticketsForm.get('description') as FormControl;
  }

  ngOnInit(): void {
    this.ticketsForm = this._formBuilder.group({
      description: ['', Validators.required],
    });

    this._actions$.pipe(takeUntil(this._unsubscribeAll), ofActionCompleted(Add))
      .subscribe(result => {
        const {error, successful} = result.result;
        if(error){
          this.message = `${(error as HttpErrorResponse)['error'].message}`;          
        }
        if(successful){
          this.message = 'Ticket Added succesfully...'; 
          this._cdr.markForCheck(); 
          setTimeout(()=>{
            this.message = undefined;
            this._cdr.markForCheck();
          },3000)          
          this.ticketsForm.reset();        
        }
        this.ticketsForm.enable();
      });
  }

  cancel(): void {
    this._store.dispatch(new ChangeMode('list'));
  }

  save(): void {
    this.ticketsForm.disable();
    this._store.dispatch(new Add(this.description.value));
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this._store.dispatch(new ChangeMode('list'));
  }
}
