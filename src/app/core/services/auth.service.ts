import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
// FIX: Added 'map' explicitly into the RxJS operators import list
import { catchError, map, switchMap } from 'rxjs/operators';

import * as PouchDBNamespace from 'pouchdb-browser';
const PouchDB = ((PouchDBNamespace as any).default || PouchDBNamespace) as any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private db: any;
  private apiUrl = 'http://test-demo.aemenersol.com/api/auth/login';

  constructor(private http: HttpClient) {
    // initialize PouchDB local database
    this.db = new PouchDB('aem_local_db_v2');
    
    this.seedLocalUser();
  }

  private seedLocalUser() {
    const testUser = {
      _id: 'user@aemenersol.com', 
      password: 'Test@123',
      name: 'John Doe'
    };

    this.db.get(testUser._id)
      .then(() => console.log('PouchDB: Test user already seeded.'))
      .catch((err: any) => {
        if (err.status === 404) {
          this.db.put(testUser)
            .then(() => console.log('PouchDB: Test credentials successfully seeded locally!'))
            .catch((e: any) => console.error('PouchDB seeding error:', e));
        }
      });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('bearer_token');
  }

  /**
   * 1. Try the API first.
   * 2. If the API is invalid/fails, fall back to checking PouchDB.
   */
  login(username: string, password: string): Observable<any> {
    const sanitizedUsername = username.trim().toLowerCase();

    // Step 1: Hit the real remote login API first
    return this.http.post(this.apiUrl, { username: sanitizedUsername, password }, { responseType: 'text' }).pipe(
      // FIX: Explicitly typed 'tokenResponse: any' to satisfy the compiler
      map((tokenResponse: any) => {
        console.log('API Login successful! Using live server session.');
        return tokenResponse;
      }),
      catchError((apiError) => {
        console.warn('API login failed or invalid. Falling back to PouchDB validation...', apiError);

        // Step 2: API failed/invalid, now look up credentials inside local PouchDB
        return from(this.db.get(sanitizedUsername)).pipe(
          map((userDoc: any) => {
            if (userDoc.password === password) {
              console.log('PouchDB: Local offline fallback validation successful!');
              return 'mock-offline-pouchdb-token';
            } else {
              console.error('PouchDB: Local password does not match.');
              return null;
            }
          }),
          catchError((pouchError) => {
            console.error('PouchDB: User not found locally either.', pouchError);
            return of(null);
          })
        );
      })
    );
  }
}