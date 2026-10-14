import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CRUDServiciosComponent } from '../crud-servicios.component';

describe('CRUDServiciosComponent', () => {
  let component: CRUDServiciosComponent;
  let fixture: ComponentFixture<CRUDServiciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CRUDServiciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CRUDServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
