import { AuthService } from 'src/app/core/auth/services/auth.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

  showHelpPopup = false;
  showMenuLists = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  openHelp() {
    this.showHelpPopup = true;
  }

  closeHelp() {
    this.showHelpPopup = false;
  }

  logout() {
    this.authService.logout();
  }

  isListasRoute(): boolean {
    return this.router.url.includes('/dashboard/listas');
  }

}
