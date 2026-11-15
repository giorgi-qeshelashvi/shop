import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiAreaService } from '../services/api-area.service';
import { ToolsService } from '../services/tools.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  constructor(
    private api: ApiAreaService,
    public _cookie: CookieService,
    private tools: ToolsService,
  ) {}
  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() changeEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() loggedEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() loggedInfo: EventEmitter<any> = new EventEmitter();

  public accessToken: any;
  public errorSMS: string | undefined;
  public errAlert: boolean = false;
  public successLogin: boolean = false;
  public recoveryMode: boolean = false;
  public recoveryMessage: string = '';
  public recoveryError: string = '';
  public recoveryPending: boolean = false;

  protected signInForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', Validators.required),
  });

  protected recoveryForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.required],
    }),
  });

  signIn() {
    this.api.signIn(this.signInForm.value).subscribe({
      next: (data: any) => {
        this._cookie.set('user', data.access_token, 1);
        this.errAlert = false;
        this.successLogin = true;
        this.api.profileInfo().subscribe((data: any) => {
          let userInfo = {
            firstName: data.firstName,
            avatar: data.avatar,
          };
          this.tools.userNavbarInfo.set(userInfo);
          this._cookie.set('userInfo', JSON.stringify(userInfo), 1);
        });

        if (this.successLogin) {
          setTimeout(() => {
            this.closeEmit.emit(false);
            this.loggedEmit.emit(true);
          }, 1000);
        }
      },
      error: (err) => {
        this.errorSMS = err.error.error;
        this.errAlert = true;
      },
    });
  }

  closeForm() {
    this.closeEmit.emit(false);
  }

  outSide(event: any) {
    if (event.target.className == 'signArea') {
      this.closeEmit.emit(false);
    }
  }

  change() {
    this.changeEmit.emit(true);
  }

  openRecovery() {
    this.recoveryForm.patchValue({
      email: this.signInForm.get('email')?.value ?? '',
    });
    this.recoveryMessage = '';
    this.recoveryError = '';
    this.recoveryMode = true;
  }

  closeRecovery() {
    this.recoveryMode = false;
    this.recoveryMessage = '';
    this.recoveryError = '';
  }

  recoverPassword() {
    if (this.recoveryForm.invalid || this.recoveryPending) {
      this.recoveryForm.markAllAsTouched();
      return;
    }

    this.recoveryPending = true;
    this.recoveryMessage = '';
    this.recoveryError = '';
    this.api.recoverPassword(this.recoveryForm.controls.email.value).subscribe({
      next: () => {
        this.recoveryPending = false;
        this.recoveryMessage =
          'If an account exists for this email, recovery instructions have been sent.';
      },
      error: (err) => {
        this.recoveryPending = false;
        const message = err.error?.error ?? err.error?.message;
        this.recoveryError =
          typeof message === 'string'
            ? message
            : 'Could not send recovery instructions. Please try again.';
      },
    });
  }
}
