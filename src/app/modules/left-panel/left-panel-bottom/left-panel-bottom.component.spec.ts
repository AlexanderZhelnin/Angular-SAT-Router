import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftPanelBottomComponent } from './left-panel-bottom.component';

describe('LeftPanelBottomComponent', () => {
  let component: LeftPanelBottomComponent;
  let fixture: ComponentFixture<LeftPanelBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeftPanelBottomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftPanelBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
