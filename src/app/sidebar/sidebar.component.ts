import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ProductsAreaService } from '../services/products-area.service';
import { AllProductArea } from '../../interfaces/all-product-area';
import { ProductFilterOptions } from '../../interfaces/product-filter-options';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  constructor(private productApi: ProductsAreaService) {}

  @Input() selectedCategory: string = '';

  @Output() sendCategoryData: EventEmitter<string> = new EventEmitter();
  @Output() sendFilterData: EventEmitter<ProductFilterOptions> =
    new EventEmitter();
  @Output() sendSearchInfo: EventEmitter<ProductFilterOptions> =
    new EventEmitter();

  @ViewChild('brandsUl') protected brandsUl!: ElementRef;
  @ViewChild('categoriesUl') protected categoriesUl!: ElementRef;
  @ViewChild('sortSelect') protected sortSelect!: ElementRef;

  protected categories: any;
  protected activeCategory: string = '';
  public searchText: string = '';
  public minPrice: string = '';
  public maxPrice: string = '';
  public rating!: number;
  public sort: string = '';
  public type: string = '';
  public activeBrand: string = '';

  protected brands: string[] = [];
  ngOnInit(): void {
    this.activeCategory = this.selectedCategory;
    this.getCategoriesList();
    this.loadBrands();
  }

  searchData() {
    this.sendSearchInfo.emit(this.getFilterOptions());
  }

  filterData() {
    this.sendFilterData.emit(this.getFilterOptions());
  }

  private getFilterOptions(): ProductFilterOptions {
    return {
      search: this.searchText,
      min: this.minPrice,
      max: this.maxPrice,
      rating: this.rating ?? '',
      type: this.type,
      sort: this.sort,
      brand: this.activeBrand,
      categoryId: this.activeCategory,
    };
  }

  getCategoriesList() {
    this.productApi.getCategories().subscribe({
      next: (list: any) => {
        this.categories = list;
      },
      error: (error) => console.error('Could not load categories', error),
    });
  }

  selectCategory(categoryId: string) {
    this.activeCategory = categoryId;
    this.activeBrand = '';
    this.loadBrands();
    this.sendCategoryData.emit(categoryId);
  }

  private loadBrands() {
    if (!this.activeCategory) {
      this.productApi.getBrands().subscribe({
        next: (list: string[]) => {
          this.brands = list;
        },
        error: (error) => console.error('Could not load brands', error),
      });
      return;
    }

    this.productApi.getListByCategory(this.activeCategory, 1, 50).subscribe({
      next: (data: AllProductArea) => {
        this.brands = [
          ...new Set(data.products.map((product) => product.brand)),
        ];
      },
      error: (error) => console.error('Could not load category brands', error),
    });
  }

  getBrandData(brand: string) {
    this.activeBrand = brand;
    this.filterData();
  }

  showAllBrands() {
    this.activeBrand = '';
    this.filterData();
  }
}
