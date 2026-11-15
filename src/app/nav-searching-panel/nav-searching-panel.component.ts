import {
  Component,
  signal,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { ProductsAreaService } from '../services/products-area.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ToolsService } from '../services/tools.service';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
  timer,
} from 'rxjs';

@Component({
  selector: 'app-nav-searching-panel',
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './nav-searching-panel.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './nav-searching-panel.component.css',
})
export class NavSearchingPanelComponent {
  constructor(
    private service: ProductsAreaService,
    public tools: ToolsService,
  ) {
    this.searchingFn();
  }
  searchWord = input<string>('');

  searchedList = signal<any[]>([]);

  searchingFn() {
    toObservable(this.searchWord)
      .pipe(
        map((text) => text.trim()),
        distinctUntilChanged(),
        tap((text) => {
          if (!text) {
            this.tools.isSectionShown.set(false);
            this.searchedList.set([]);
          }
        }),
        switchMap((text) =>
          text
            ? timer(500).pipe(
                switchMap(() => this.service.getSearchedData(text)),
              )
            : EMPTY,
        ),
      )
      .subscribe((data: any) => {
        this.tools.isSectionShown.set(true);
        this.searchedList.set(data.products);
      });
  }
}
