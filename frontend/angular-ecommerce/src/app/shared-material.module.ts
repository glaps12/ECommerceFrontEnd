import { NgModule } from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

const MODULES = [
  LayoutModule, ScrollingModule, MatBadgeModule, MatButtonModule, MatButtonToggleModule,
  MatCardModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule,
  MatListModule, MatPaginatorModule, MatMenuModule, MatProgressSpinnerModule, MatRadioModule,
  MatSelectModule, MatSidenavModule, MatSnackBarModule, MatStepperModule, MatTableModule,
  MatToolbarModule, MatCheckboxModule, MatTooltipModule, MatTabsModule,
  MatDatepickerModule, MatNativeDateModule
];

@NgModule({ imports: MODULES, exports: MODULES })
export class SharedMaterialModule {}
