import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesService } from '../../services/games.service';
import { GamesModel } from '../../models/games.model';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games.html',
  styleUrl: './games.css'
})
export class Games implements OnInit {
  private gamesService = inject(GamesService);
  private cdr = inject(ChangeDetectorRef);

  games: GamesModel[] = [];
  gameSeleccionado: GamesModel = this.crearGameVacio();
  modoEdicion: boolean = false;
  
  mostrarModal: boolean = false;

  idBusqueda: number | null = null;
  gameFiltrado: GamesModel | null = null;
  mensajeError: string = '';
  conexionActiva: boolean = true;

  ngOnInit(): void {
    this.cargarGames();
  }

  cargarGames(): void {
    this.gamesService.getAll().subscribe({
      next: (data: any) => {
        this.games = (data as GamesModel[]).sort((a: GamesModel, b: GamesModel) => (a.id && b.id) ? a.id - b.id : 0);
        this.conexionActiva = true;
        this.mensajeError = '';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        if (err.status === 0) {
          this.conexionActiva = false;
          this.mensajeError = 'No hubo conexión con la API (Backend apagado).';
        }
        this.cdr.detectChanges();
      }
    });
  }

  buscarPorId(): void {
    if (!this.idBusqueda) {
      this.cargarGames();
      this.gameFiltrado = null;
      return;
    }

    this.gamesService.getById(this.idBusqueda).subscribe({
      next: (data: any) => {
        if (data) {
          this.gameFiltrado = data as GamesModel;
          this.mensajeError = '';
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        this.gameFiltrado = null;
        if (err.status === 404 || err.status === 400) {
          this.mensajeError = 'No se encontró el registro con ese ID.';
        } else if (err.status === 0) {
          this.conexionActiva = false;
          this.mensajeError = 'No hubo conexión con la API.';
        } else {
          this.mensajeError = 'Error al consultar el ID.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  guardarGame(): void {
    if (this.modoEdicion && this.gameSeleccionado.id) {
      this.gamesService.update(this.gameSeleccionado.id, this.gameSeleccionado).subscribe({
        next: () => {
          this.cargarGames();
          this.cerrarModal();
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error al actualizar', err)
      });
    } else {
      this.gamesService.create(this.gameSeleccionado).subscribe({
        next: () => {
          this.cargarGames();
          this.cerrarModal();
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('Error al crear', err)
      });
    }
  }

  abrirModalCrear(): void {
    this.resetFormulario(); 
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  editar(juego: GamesModel): void {
    this.gameSeleccionado = { ...juego };
    this.modoEdicion = true;
    this.mostrarModal = true; 
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.resetFormulario();
    this.cdr.detectChanges(); 
  }

  eliminar(id: number | null | undefined): void {
    if (!id) {
      console.warn('ID inválido para eliminar');
      return;
    }

    const confirmado = window.confirm('¿Estás seguro de que deseas eliminar este videojuego?');
    if (!confirmado) {
      return;
    }

    this.gamesService.delete(id).subscribe({
      next: () => {
        this.games = this.games.filter(j => j.id !== id);
        if (this.gameFiltrado && this.gameFiltrado.id === id) {
          this.gameFiltrado = null;
          this.idBusqueda = null;
        }
        this.cargarGames();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        if (err.status === 200 || err.status === 204) {
          this.games = this.games.filter(j => j.id !== id);
          if (this.gameFiltrado && this.gameFiltrado.id === id) {
            this.gameFiltrado = null;
            this.idBusqueda = null;
          }
          this.cargarGames();
        } else {
          console.error('Error al eliminar', err);
          this.cargarGames();
        }
        this.cdr.detectChanges();
      }
    });
  }

  resetFormulario(): void {
    this.gameSeleccionado = this.crearGameVacio();
    this.modoEdicion = false;
  }

  private crearGameVacio(): GamesModel {
    return {
      titulo: '',
      genero: '',
      desarrollador: '',
      precio: 0,
      stock: 0,
      disponible: true
    };
  }
}