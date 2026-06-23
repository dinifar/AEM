import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

onSubmit(): void {
  if (this.loginForm.invalid) return;

  const { username, password } = this.loginForm.value;

  this.authService.login(username, password).subscribe({
    next: (tokenResponse) => {
      if (tokenResponse) {
        // Strip out string quotes if present
        let cleanToken = tokenResponse;
        if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
          cleanToken = cleanToken.slice(1, -1);
        }

        // Store the bearer token for the dashboard to read
        localStorage.setItem('bearer_token', cleanToken);
        console.log('Token successfully stored into local configuration.');

        // Navigate to dashboard view window
        this.router.navigate(['/dashboard']);
      } else {
        alert('Login Validation Failed! Please check your credentials.');
      }
    },
    error: (err) => {
      alert('Authentication error encountered.');
    }
  });
}
}