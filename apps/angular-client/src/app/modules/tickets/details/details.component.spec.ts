import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { of } from 'rxjs';

import { ApiService, TicketsState } from '../../../data';
import { DetailsComponent } from './details.component';
import { DetailsModule } from './details.module';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;

  const fakeActivatedRoute = {
    paramMap: of(convertToParamMap({ id: 1 })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailsComponent],
      imports: [
        NgxsModule.forRoot([TicketsState], { developmentMode: true }),
        HttpClientTestingModule,
        DetailsModule,
      ],
      providers: [
        ApiService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
