import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AddTicketComponent } from '../add-ticket/add-ticket.component';
import { ListComponent } from './list.component';
import { listRoutes } from './list.routing';

@NgModule({
  declarations: [ListComponent, AddTicketComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(listRoutes),
    CommonModule,
  ],
})
export class ListModule {}
