import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { EMPTY, catchError, switchMap, tap, throwError } from 'rxjs';
import { ApiAreaService } from './api-area.service';
import { ToolsService } from './tools.service';

@Injectable({
  providedIn: 'root',
})
export class CartAreaService {
  constructor(
    private http: HttpClient,
    private cookie: CookieService,
    private api: ApiAreaService,
    private tools: ToolsService,
  ) {}

  getCart() {
    return this.http.get('https://api.everrest.educata.dev/shop/cart');
  }

  createCart(body: any) {
    return this.http.post(
      'https://api.everrest.educata.dev/shop/cart/product',
      body,
    );
  }

  addtoCart(body: any) {
    return this.http.patch(
      'https://api.everrest.educata.dev/shop/cart/product',
      body,
    );
  }

  addProduct(id: string, quantity = 1) {
    if (!this.cookie.get('user')) {
      this.tools.isSignedIn.next(true);
      return EMPTY;
    }

    return this.api.profileInfo().pipe(
      switchMap((profile: any) => {
        const product = { id, quantity };
        if (!profile.cartID) {
          return this.createCart(product);
        }

        return this.getCart().pipe(
          switchMap((cart: any) => {
            const existing = cart.products.find(
              (item: any) => item.productId === id,
            );
            return this.addtoCart({
              id,
              quantity: quantity + (existing?.quantity ?? 0),
            });
          }),
        );
      }),
      tap((cart: any) => this.tools.cartQuantity.set(cart.products.length)),
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.tools.isSignedIn.next(true);
        }
        return throwError(() => error);
      }),
    );
  }

  deleteProduct(body: any) {
    return this.http.delete(
      'https://api.everrest.educata.dev/shop/cart/product',
      { body: body },
    );
  }

  removeAll() {
    return this.http.delete('https://api.everrest.educata.dev/shop/cart');
  }

  checkOut() {
    return this.http.post(
      'https://api.everrest.educata.dev/shop/cart/checkout',
      '',
    );
  }
}
