import { AuthService } from 'src/app/core/auth/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  showHelpPopup = false;

  constructor(
    private authService: AuthService
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

}
