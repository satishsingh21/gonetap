import { ChangeDetectorRef, Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';

import { UsersService } from './users.service';

// declare var googleYolo: any;

const GOOGLE_INPUT_PARAMS = {
  uri: 'https://accounts.google.com',
  clientId: environment.googleClientId
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'google-one-tap';
  googleYolo: any;
  users: IUser[];
  currentUser: IUser;

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  constructor(private cookieService: CookieService, private dataService: UsersService,
    private cdr: ChangeDetectorRef) {
    this.subscribeToGoogleYolo();
  }

  signUpWithGoogle(): void {
    this.fetchGoogleHint();
  }

  retrieveGoogle(): void {
    if (this.cookieService.get('googleOneTap')) {
      this.loginUser();
    } else {
      this.googleYolo.retrieve({
        supportedAuthMethods: [
          GOOGLE_INPUT_PARAMS.uri
          // 'googleyolo://id-and-password' // provides saved user-pwd in browser for the current domain
        ],
        supportedIdTokenProviders: [GOOGLE_INPUT_PARAMS]
      }).then((res: YoloResponse) => {
        if (res.idToken) {
          this.loginUser(res);
        }
      }, error => this.onGoogleError(error));
    }
  }

  fetchUsers(): void {
    this.dataService.getUsers().subscribe((res: { data: IUser[], status: number, message: string }) => {
      if (res.status === 200) {
        this.users = res.data;
      } else {
        console.log(`${res.status}: ${res.message}`);
      }
    }, err => console.log(err));
  }

  logout(): void {
    this.currentUser = undefined;
    this.users = undefined;
    this.cookieService.delete('googleOneTap');
    this.cdr.detectChanges();
  }

  private subscribeToGoogleYolo(): void {
    window['onGoogleYoloLoad'] = (googleyolo) => {
      this.googleYolo = googleyolo;
      this.retrieveGoogle(); // to sign in
    };
  }

  private fetchGoogleHint(): void {
    // sign up
    this.googleYolo.hint({
      supportedAuthMethods: [GOOGLE_INPUT_PARAMS.uri],
      supportedIdTokenProviders: [GOOGLE_INPUT_PARAMS]
    }).then((res: YoloResponse) => {
      if (res.idToken) {
        this.registerUser(res);
      }
    }, error => this.onGoogleError(error, true));
  }

  private registerUser(user: YoloResponse): void {
    const userInfo = {
      name: user.displayName,
      emailId: user.id,
      googleTokenId: user.idToken
    };
    this.dataService.registerUser(userInfo).subscribe(
      (registeredUser: { data: { auth_token: string } }) => this.fetchUserInfo(registeredUser.data.auth_token),
      err => console.log(err));
  }

  private loginUser(user?: YoloResponse): void {
    const userInfo = user ? {
      name: user.displayName,
      emailId: user.id,
      googleTokenId: user.idToken
    } : undefined;
    this.dataService.loginUser(userInfo).subscribe(
      (loginResponse: { data: { auth_token: string, user: IUser, token: string } }) => {
        if (loginResponse.data.auth_token) {
          this.fetchUserInfo(loginResponse.data.auth_token);
        } else {
          this.updateUserToken(loginResponse.data);
        }
      },
      err => {
        if (err.status === 501) {
          this.logout();
          this.retrieveGoogle();
        }
        console.log(err);
      });
  }

  private fetchUserInfo(authToken: string): void {
    this.dataService.getUserInfo(authToken).subscribe(
      (registeredUser: { data: { user: IUser, token: string } }) => this.updateUserToken(registeredUser.data));
  }

  private updateUserToken(loginInfo: { user: IUser, token: string }): void {
    this.currentUser = loginInfo.user;
    if (loginInfo.token) {
      this.cookieService.set('googleOneTap', loginInfo.token);
    }
    this.cdr.detectChanges();
  }

  private onGoogleError(error, isSignUp = false): void {
    switch (error.type) {
      case 'noCredentialsAvailable':
        if (!isSignUp) {
          this.signUpWithGoogle();
        } else {
          alert('No google account(s) available.');
        }
        break;
      case 'userCanceled':
      case 'requestFailed':
      case 'operationCanceled':
      case 'illegalConcurrentRequest':
      case 'initializationError':
      case 'configurationError':
      default:
        console.log(error.type);
    }
  }
}

interface YoloResponse {
  authMethod: string;
  displayName: string;
  id: string;
  idToken: string;
  profilePicture: string;
}

interface IUser {
  name: string;
  emailId: string;
}
