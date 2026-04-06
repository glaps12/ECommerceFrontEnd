import { NgModule } from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

const MODULES = [
  LayoutModule, ScrollingModule, MatBadgeModule, MatButtonModule, MatCardModule, MatDividerModule,
  MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatPaginatorModule,
  MatSelectModule, MatSidenavModule, MatTableModule, MatToolbarModule,
];

@NgModule({ imports: MODULES, exports: MODULES })
export class SharedMaterialModule {}
