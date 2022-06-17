import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DetailsComponent } from './details.component';
import { detailsRoutes } from './details.routing';

@NgModule({
  declarations: [DetailsComponent],
  imports: [
    RouterModule.forChild(detailsRoutes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class DetailsModule {}
