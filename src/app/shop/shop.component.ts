import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ProductsAreaService } from '../services/products-area.service';
import { FormsModule } from '@angular/forms';
import { Product } from '../../interfaces/product';
import { AllProductArea } from '../../interfaces/all-product-area';
import { FilteredProducts } from '../../interfaces/filtered-products';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartAreaService } from '../services/cart-area.service';
import { ActivatedRoute } from '@angular/router';
import { ProductFilterOptions } from '../../interfaces/product-filter-options';

@Component({
  selector: 'app-shop',
  imports: [SidebarComponent, FormsModule, RouterModule, CommonModule],
  templateUrl: './shop.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './shop.component.css',
})
export class ShopComponent implements OnInit {
  constructor(
    private prodService: ProductsAreaService,
    private cartService: CartAreaService,
    private route: ActivatedRoute,
  ) {
    const categoryId = this.route.snapshot.queryParamMap.get('categoryId');
    this.currentCategory =
      categoryId === '1' || categoryId === '2' ? categoryId : undefined;
  }

  ngOnInit(): void {
    if (this.currentCategory) {
      this.showByCategory(this.currentCategory, 1);
      return;
    }

    this.showProducts(this.currentPage);
  }

  public currentCategory?: string;
  public productList: Product[] = [];
  public maxPage: number = 1;
  public currentPage: number = 1;
  public pageSize: any = 15;
  public totalSize!: any;
  public isCategoryShown: boolean = false;
  private activeFilters: ProductFilterOptions | null = null;
  public altImage: string =
    'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko=';

  pagination(data: FilteredProducts | AllProductArea) {
    this.productList = data.products;
    let pages = Math.ceil(data.total / this.pageSize);
    this.maxPage = pages;
  }

  showProducts(page: number | string = 1) {
    this.isCategoryShown = false;
    this.currentCategory = undefined;
    this.activeFilters = null;
    this.currentPage = +page;
    this.prodService
      .getCardsOnShopPage(page)
      .subscribe((data: AllProductArea) => {
        this.productList = data.products;
        this.totalSize = data.total;
        this.pagination(data);
      });
  }

  search(filters: ProductFilterOptions) {
    this.filterProducts(filters);
  }

  filterProducts(filters: ProductFilterOptions) {
    this.activeFilters = filters;
    this.currentPage = 1;
    this.loadFilteredProducts(1);
  }

  showByCategory(category: string, pageNum: number) {
    if (!category) {
      this.showProducts(1);
      return;
    }

    this.activeFilters = null;
    this.isCategoryShown = true;
    this.currentCategory = category;
    this.currentPage = pageNum;
    this.prodService
      .getListByCategory(category, this.currentPage, this.pageSize)
      .subscribe((data: AllProductArea) => {
        this.productList = data.products;
        this.pagination(data);
      });
  }

  private loadFilteredProducts(pageNum: number) {
    if (!this.activeFilters) return;

    this.prodService
      .filterData(this.activeFilters, this.pageSize, pageNum)
      .subscribe({
        next: (data: FilteredProducts) => {
          this.currentPage = pageNum;
          this.pagination(data);
        },
        error: (error) => console.error('Could not filter products', error),
      });
  }

  selectCategory(categoryId: string) {
    if (categoryId) {
      this.showByCategory(categoryId, 1);
      return;
    }

    this.showProducts(1);
  }

  goToPage(pageNum: number) {
    if (pageNum < 1 || pageNum > this.maxPage || pageNum === this.currentPage) {
      return;
    }

    if (this.activeFilters) {
      this.loadFilteredProducts(pageNum);
      return;
    }

    if (this.currentCategory) {
      this.showByCategory(this.currentCategory, pageNum);
      return;
    }

    this.showProducts(pageNum);
  }

  addToCart(id: string) {
    this.cartService.addProduct(id).subscribe({
      error: (error) => console.error('Could not add product to cart', error),
    });
  }
}
