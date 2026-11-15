import {
  Component,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { ProductsAreaService } from '../../services/products-area.service';
import { CommonModule } from '@angular/common';
import { Product, ProductRating } from '../../../interfaces/product';
import { CartAreaService } from '../../services/cart-area.service';
import { ToolsService } from '../../services/tools.service';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { ApiAreaService } from '../../services/api-area.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-details',
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './details.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  constructor(
    private actR: ActivatedRoute,
    private service: ProductsAreaService,
    public router: Router,
    public tools: ToolsService,
    private cartServ: CartAreaService,
    private apiArea: ApiAreaService,
    private cookie: CookieService,
  ) {}

  ngOnInit(): void {
    this.getParam();
  }
  public prodINFO = signal<any>({});
  public mainImage!: string;
  public allImages!: string[];
  public starNum!: number;
  public prodQuant: number = 1;
  public isRateCardShown: boolean = false;
  public rateNum?: number;
  public hoveredRate: number = 0;
  public userRating?: number;
  public ratingPending: boolean = false;
  public ratingError: string = '';
  public ratingSuccess: string = '';
  private currentUserId?: string;
  public altImage: string =
    'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko=';

  getParam() {
    this.actR.params.subscribe((data: Params) => {
      this.service
        .getProductDetailInfo(data['id'])
        .subscribe((data: Product) => {
          this.prodINFO.set(data);
          this.mainImage = data.images[0];
          this.allImages = data.images;
          this.starNum = Math.round(data.rating);
          this.userRating = undefined;
          this.rateNum = undefined;
          this.currentUserId = undefined;
          if (this.cookie.get('user')) {
            this.apiArea.profileInfo().subscribe({
              next: (user: any) => {
                this.currentUserId = user._id;
                this.userRating = data.ratings?.find(
                  (rating: ProductRating) => rating.userId === user._id,
                )?.value;
                if (this.rateNum === undefined) {
                  this.rateNum = this.userRating;
                }
              },
              error: (error) => {
                console.error('Could not load your product rating', error);
                if (error.status === 401 || error.status === 403) {
                  this.tools.isSignedIn.next(true);
                }
              },
            });
          }
        });
    });
  }

  zoomImg(currImg: string) {
    this.mainImage = currImg;
  }

  updateQuantity(action: string) {
    action == '+' ? this.prodQuant++ : this.prodQuant--;
  }

  cartBTN(id: string) {
    this.cartServ.addProduct(id, this.prodQuant).subscribe({
      error: (error) => console.error('Could not add product to cart', error),
    });
  }

  openRateCard() {
    if (!this.cookie.get('user')) {
      this.tools.isSignedIn.next(true);
      return;
    }

    this.rateNum = this.userRating;
    this.hoveredRate = 0;
    this.ratingError = '';
    this.ratingSuccess = '';
    this.isRateCardShown = true;
  }

  chooseRate(rateNum: number) {
    this.hoveredRate = rateNum;
  }

  selectRate(rateNum: number) {
    this.rateNum = rateNum;
    this.ratingError = '';
    this.ratingSuccess = '';
  }

  resetStars() {
    this.hoveredRate = 0;
  }

  enterRate() {
    if (!this.cookie.get('user')) {
      this.tools.isSignedIn.next(true);
      return;
    }
    if (!this.rateNum || this.ratingPending) {
      return;
    }

    const submittedRating = this.rateNum;
    this.ratingPending = true;
    this.ratingError = '';
    this.ratingSuccess = '';
    this.service
      .rate({ productId: this.prodINFO()._id, rate: submittedRating })
      .subscribe({
        next: (data: Product) => {
          this.prodINFO.set(data);
          this.starNum = Math.round(data.rating);
          this.userRating =
            data.ratings?.find((rating) => rating.userId === this.currentUserId)
              ?.value ?? submittedRating;
          this.rateNum = this.userRating;
          this.ratingPending = false;
          this.ratingSuccess = 'Your rating has been saved.';
        },
        error: (error) => {
          this.ratingPending = false;
          if (error.status === 401 || error.status === 403) {
            this.tools.isSignedIn.next(true);
          }
          this.ratingError =
            error.error?.error ??
            error.error?.message ??
            'Could not save your rating. Please try again.';
        },
      });
  }
}
