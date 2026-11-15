import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AllProductArea } from '../../interfaces/all-product-area';
import { FilteredProducts } from '../../interfaces/filtered-products';
import { Product } from '../../interfaces/product';
import { ProductFilterOptions } from '../../interfaces/product-filter-options';

@Injectable({
  providedIn: 'root',
})
export class ProductsAreaService {
  constructor(private http: HttpClient) {}

  getCategories() {
    return this.http.get(
      'https://api.everrest.educata.dev/shop/products/categories',
    );
  }

  getListByCategory(id: any, page: any, size: any) {
    return this.http.get<AllProductArea>(
      `https://api.everrest.educata.dev/shop/products/category/${id}?page_index=${page}&page_size=${size}`,
    );
  }

  getBrands() {
    return this.http.get<string[]>(
      'https://api.everrest.educata.dev/shop/products/brands',
    );
  }

  getExactBrandData(name: string) {
    return this.http.get<AllProductArea>(
      `https://api.everrest.educata.dev/shop/products/brand/${name}?page_size=10`,
    );
  }

  getSearchedData(searchInput: string) {
    return this.http.get<FilteredProducts>(
      `https://api.everrest.educata.dev/shop/products/search?page_size=38&keywords=${searchInput}`,
    );
  }

  filterData(filters: ProductFilterOptions, size: number, page: number = 1) {
    let params = new HttpParams()
      .set('page_index', page)
      .set('page_size', size);

    if (filters.search) params = params.set('keywords', filters.search);
    if (filters.categoryId) {
      params = params.set('category_id', filters.categoryId);
    }
    if (filters.brand) params = params.set('brand', filters.brand);
    if (filters.rating) params = params.set('rating', filters.rating);
    if (filters.min) params = params.set('price_min', filters.min);
    if (filters.max) params = params.set('price_max', filters.max);
    if (filters.type) params = params.set('sort_by', filters.type);
    if (filters.sort) params = params.set('sort_direction', filters.sort);

    return this.http.get<FilteredProducts>(
      'https://api.everrest.educata.dev/shop/products/search',
      { params },
    );
  }

  getCardsOnShopPage(page: any, size: any = 15) {
    return this.http.get<AllProductArea>(
      `https://api.everrest.educata.dev/shop/products/all?page_index=${page}&page_size=${size}`,
    );
  }

  getProductDetailInfo(id: string) {
    return this.http.get<Product>(
      `https://api.everrest.educata.dev/shop/products/id/${id}`,
    );
  }

  rate(info: { productId: string; rate: number }) {
    return this.http.post<Product>(
      'https://api.everrest.educata.dev/shop/products/rate',
      info,
    );
  }
}
