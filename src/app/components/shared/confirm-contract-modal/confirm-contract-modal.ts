import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-contract-modal',
  standalone: false,
  templateUrl: './confirm-contract-modal.html',
  styleUrl: './confirm-contract-modal.css',
})
export class ConfirmContractModal {
  @Input() visible = false;
  @Input() contractNumber: string = '';

  @Output() closed = new EventEmitter<void>();
  @Output() validated = new EventEmitter<string>();

  fadeOut = false;

  closeModal() {
    this.fadeOut = true;
    setTimeout(() => {
      this.visible = false;
      this.fadeOut = false;
      this.closed.emit();
    }, 300);
  }

  confirm() {
    this.fadeOut = true;
    setTimeout(() => {
      this.validated.emit(this.contractNumber);
      this.visible = false;
      this.fadeOut = false;
    }, 300);
  }
}
