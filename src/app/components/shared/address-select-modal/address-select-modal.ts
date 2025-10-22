import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-address-select-modal',
  standalone: false,
  templateUrl: './address-select-modal.html',
  styleUrl: './address-select-modal.css',
})
export class AddressSelectModal {
  @Input() visible = false;
  @Input() addresses: string[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() selected = new EventEmitter<string>();

  selectedAddress: string | null = null;

  close() {
    this.visibleChange.emit(false);
  }

  confirm() {
    if (this.selectedAddress) {
      this.selected.emit(this.selectedAddress);
      this.close();
    }
  }
}
