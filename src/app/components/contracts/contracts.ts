import { Component } from '@angular/core';
import { ContractService } from '../../services/contracts/contract.service';
import { AuthService } from '../../services/auth/auth.service';
import { Contract } from '../../models/contract.model';

@Component({
  selector: 'app-contracts',
  standalone: false,
  templateUrl: './contracts.html',
  styleUrl: './contracts.css',
})
export class Contracts {
  user: any;
  contracts: Contract[] = [];
  loading = true;

  constructor(private contractService: ContractService, private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    this.contractService.getByUser(this.user.id).subscribe({
      next: (data) => {
        this.contracts = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error al cargar contratos', err);
      },
    });
  }
  actualizarTotal() {}

  isGridView = false;
  dots = Array(6).fill(0);

  toggleView() {
    this.isGridView = !this.isGridView;
  }
}
