import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UsersService {
    readonly options = { withCredentials: true };

    constructor(private httpClient: HttpClient) { }

    getUsers() {
        return this.httpClient.get('/api/users', this.options);
    }

    registerUser(user: { name: string, emailId: string, googleTokenId: string }) {
        return this.httpClient.post('/public/signUp', user);
    }

    loginUser(user?: { name: string, emailId: string, googleTokenId: string }) {
        return this.httpClient.post('/public/login', user, this.options);
    }

    getUserInfo(userIdentifier: string) {
        return this.httpClient.get('/public/userInfo', { headers: new HttpHeaders({ 'user-identifier': userIdentifier }) });
    }
}
