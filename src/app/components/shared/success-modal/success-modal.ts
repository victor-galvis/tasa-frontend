import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-success-modal',
  standalone: false,
  templateUrl: './success-modal.html',
  styleUrl: './success-modal.css',
})
export class SuccessModal {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
