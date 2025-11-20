import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-modal',
  standalone: false,
  templateUrl: './custom-modal.html',
  styleUrl: './custom-modal.css',
})
export class CustomModal {
  @Input() visible = false;
  @Input() title = '';
  @Input() message = '';
  @Input() type = 'success';
  @Input() buttonText = 'Cerrar';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  fadeOut = false;

  closeModal(event?: MouseEvent) {
  if (event) event.stopPropagation();
    this.fadeOut = true;
    setTimeout(() => {
      // NO cambiar directamente el @Input visible (mejor que el padre lo controle)
      this.fadeOut = false;
      this.closed.emit();
    }, 300);
  }

 confirmAction(event?: MouseEvent) {
  if (event) event.stopPropagation();
  this.fadeOut = true;
  setTimeout(() => {
    this.fadeOut = false;
    this.confirmed.emit();
  }, 300);
}
}
