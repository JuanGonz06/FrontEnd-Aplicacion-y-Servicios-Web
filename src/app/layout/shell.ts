import { Component, inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css'
})
export class Shell {
  private renderer = inject(Renderer2);
  modoOscuro: boolean = false;

  readonly menu = [
    { ruta: '/productos', etiqueta: 'Productos'},
    { ruta: '/mascotas', etiqueta: 'Mascotas'},
    { ruta: '/games', etiqueta: 'Games'}
  ];

  toggleModoOscuro(): void {
    this.modoOscuro = !this.modoOscuro;
    
    if (this.modoOscuro) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }
}