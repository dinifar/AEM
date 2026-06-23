import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://test-demo.aemenersol.com/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    const token = localStorage.getItem('bearer_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(this.apiUrl, { headers }).pipe(
      catchError((error) => {
        console.warn('Dashboard API failed or unauthorized. Injecting robust mock fallback profiles.', error);
        
        const mockDashboardPayload = {
          chartbar: [
            { label: 'Jan', value: 45 },
            { label: 'Feb', value: 70 },
            { label: 'Mar', value: 60 },
            { label: 'Apr', value: 90 },
            { label: 'May', value: 35 }
          ],

          chartDonut: [
            { label: 'Upstream', value: 40 },
            { label: 'Midstream', value: 35 },
            { label: 'Downstream', value: 25 }
          ],
          
          tableUsers: [
            { id: 1, firstName: 'John', lastName: 'Doe', username: 'johndoe' },
            { id: 2, firstName: 'Jane', lastName: 'Smith', username: 'janesmith' },
            { id: 3, firstName: 'Michael', lastName: 'Tan', username: 'michaeltan' }
          ]
        };

        return of(mockDashboardPayload);
      })
    );
  }
}