import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../interfaces/product';
import { AllProductArea } from '../../../interfaces/all-product-area';
import { ProductsAreaService } from '../../services/products-area.service';
import { CartAreaService } from '../../services/cart-area.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-several-products',
  imports: [RouterModule, CommonModule],
  templateUrl: './several-products.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './several-products.component.css',
})
export class SeveralProductsComponent implements OnInit {
  constructor(
    private service: ProductsAreaService,
    private cartService: CartAreaService,
  ) {}
  ngOnInit(): void {
    this.showCards();
  }

  protected productList!: Product[];
  protected currentPage: number = 1;
  protected readonly pageSize = 5;
  protected totalProducts = 0;

  changeProductPage(arrow: string) {
    if (arrow === '+') {
      if (this.currentPage * this.pageSize >= this.totalProducts) {
        return;
      }
      this.currentPage++;
    } else {
      if (this.currentPage <= 1) {
        return;
      }
      this.currentPage--;
    }
    this.showCards();
  }

  showCards() {
    this.service
      .getListByCategory(2, this.currentPage, this.pageSize)
      .subscribe({
        next: (data: AllProductArea) => {
          this.productList = data.products;
          this.totalProducts = data.total;
        },
        error: (error) => {
          alert(error);
        },
      });
  }

  addToCart(id: string) {
    this.cartService.addProduct(id).subscribe({
      error: (error) => console.error('Could not add product to cart', error),
    });
  }
}
