import { Component, EventEmitter, Input, Output, ViewChildren, ElementRef, QueryList, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-otp-input',
  standalone: false,
  templateUrl: './otp-input-component.html',
  styleUrl: './otp-input-component.css'
})
export class OtpInputComponent {
  @Input() length = 5;
  @Output() codeCompleted = new EventEmitter<string>();

  // Referencia a todos los inputs
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  codigo: string[] = [];

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.codigo = Array(this.length).fill('');
  }

  onInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;

    // Si escribe y no es el último -> mover
    if (input.value && index < this.length - 1) {
      const next = input.nextElementSibling as HTMLInputElement;
      next?.focus();
    }

    // Si borra -> retroceder
    if (!input.value && index > 0) {
      const prev = input.previousElementSibling as HTMLInputElement;
      prev?.focus();
    }

    this.emitIfComplete();
  }

  onKey(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && this.codigo[index] === '' && index > 0) {
      const prev = (event.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
      prev?.focus();
    }
  }

  // Manejo de pegar código completo
  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    const pasteData = event.clipboardData?.getData('text') ?? '';
    const clean = pasteData.replace(/\D/g, ''); // solo números

    // Si quieres aceptar códigos de <= length usa clean.length > 0 && clean.length <= this.length
    if (clean.length !== this.length) {
      // opcional: si quieres aceptar y rellenar parcialmente, descomenta la sección "PARCIAL" abajo
      return;
    }

    // Actualiza el modelo
    this.codigo = clean.split('');

    // FORZAR que Angular haga el ciclo de detección para que QueryList esté actualizado
    this.cd.detectChanges();

    // Rellenar los inputs nativos y disparar eventos 'input' para que ngModel se sincronice
    const inputsArray = this.inputs.toArray();
    inputsArray.forEach((elRef, idx) => {
      const inputEl = elRef.nativeElement;
      inputEl.value = this.codigo[idx] ?? '';
      // Disparar evento input para que Angular Forms lo capture
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Focus al último input
    const last = inputsArray[this.length - 1];
    last?.nativeElement.focus();

    // Emitir
    this.emitIfComplete();
  }

  private emitIfComplete() {

    const finalCode = this.codigo.join('');

    console.log("finalCode", finalCode.length, this.length);


    if (finalCode.length === this.length) {
      this.codeCompleted.emit(finalCode);
    }
  }
}
