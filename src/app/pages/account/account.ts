import { Component, inject, OnInit } from '@angular/core'
import { AccountService } from '../../services/account.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-account',
  imports: [CommonModule],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit {
  accountService = inject(AccountService)

  async ngOnInit(): Promise<void> {
    await this.accountService.fetchAccountDetails()
  }

  async refresh(): Promise<void> {
    await this.accountService.fetchAccountDetails()
  }
}
