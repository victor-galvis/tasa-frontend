import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-no-contracts-modal',
  standalone: false,
  templateUrl: './no-contracts-modal.html',
  styleUrl: './no-contracts-modal.css',
})
export class NoContractsModal {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() viewInvoices = new EventEmitter<void>();
  @Output() registerInvoices = new EventEmitter<void>();

  onBackdropClick() {
    this.close.emit();
  }

  onRegisterInvoices() {
    this.visible = false;
    this.registerInvoices.emit();
  }
}
