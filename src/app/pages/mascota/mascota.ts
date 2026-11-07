import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/enviroment';
import { Mascota, MascotaCreate } from '../../models/mascota.model';
import { MascotaService } from '../../services/mascota.service';

type Contexto = 'listar' | 'buscar' | 'guardar' | 'eliminar';

interface FormMascota {
  nombre: string;
  especie: string;
  raza: string;
  edad: number | null;
  peso: number | null;
  vacunado: boolean;
}

function formVacio(): FormMascota {
  return { nombre: '', especie: '', raza: '', edad: null, peso: null, vacunado: false };
}

@Component({
  selector: 'app-mascotas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mascota.html',
  styleUrl: './mascota.css',
})
export class Mascotas implements OnInit {
  private readonly servicio = inject(MascotaService);

  readonly filas = signal<Mascota[]>([]);
  readonly mensaje = signal('');
  readonly sinConexion = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<'crear' | 'editar'>('crear');
  readonly errorPopup = signal('');

  idFiltro = '';
  form: FormMascota = formVacio();
  private idEditando = 0;

  ngOnInit(): void {
    this.cargar();
  }

  /** Con texto en el filtro consulta por id; vacío lista todo. */
  cargar(): void {
    const id = this.idFiltro.trim();
    if (!id) {
      this.listar();
      return;
    }
    if (!/^\d+$/.test(id)) {
      this.filas.set([]);
      this.mensaje.set('El ID debe ser un número entero.');
      return;
    }
    this.buscar(Number(id));
  }

  buscarPorId(): void {
    this.cargar();
  }

  limpiarFiltro(): void {
    this.idFiltro = '';
    this.listar();
  }

  private listar(): void {
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.sinConexion.set(false);
        this.filas.set(datos);
        this.mensaje.set(datos.length ? '' : 'No hay registros');
      },
      error: (e: HttpErrorResponse) => this.fallo(e, 'listar'),
    });
  }

  private buscar(id: number): void {
    this.servicio.obtener(id).subscribe({
      next: (mascota) => {
        this.sinConexion.set(false);
        this.filas.set([mascota]);
        this.mensaje.set('');
      },
      error: (e: HttpErrorResponse) => this.fallo(e, 'buscar'),
    });
  }

  private fallo(e: HttpErrorResponse, contexto: Contexto): void {
    this.filas.set([]);
    this.sinConexion.set(e.status === 0);
    this.mensaje.set(this.textoError(e, contexto));
  }

  abrirCrear(): void {
    this.modo.set('crear');
    this.idEditando = 0;
    this.form = formVacio();
    this.errorPopup.set('');
    this.popupAbierto.set(true);
  }

  abrirEditar(fila: Mascota): void {
    this.modo.set('editar');
    this.idEditando = fila.id;
    this.form = {
      nombre: fila.nombre,
      especie: fila.especie,
      raza: fila.raza ?? '',
      edad: fila.edad,
      peso: fila.peso,
      vacunado: fila.vacunado,
    };
    this.errorPopup.set('');
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    const f = this.form;
    const nombre = f.nombre.trim();
    const especie = f.especie.trim();
    const raza = f.raza.trim();
    const edad = f.edad;
    const peso = f.peso;

    if (nombre.length < 2 || nombre.length > 50) {
      this.errorPopup.set('El nombre debe tener entre 2 y 50 caracteres.');
      return;
    }
    if (especie.length < 3 || especie.length > 30) {
      this.errorPopup.set('La especie debe tener entre 3 y 30 caracteres.');
      return;
    }
    if (edad === null || !Number.isInteger(edad) || edad < 0 || edad > 40) {
      this.errorPopup.set('La edad debe ser un entero entre 0 y 40.');
      return;
    }
    if (peso !== null && peso <= 0) {
      this.errorPopup.set('El peso debe ser mayor que 0.');
      return;
    }

    const datos: MascotaCreate = { nombre, especie, edad, vacunado: f.vacunado };
    if (raza) datos.raza = raza;
    if (peso !== null) datos.peso = peso;

    const alExito = () => {
      this.cerrarPopup();
      this.cargar();
    };
    const alError = (e: HttpErrorResponse) => this.errorPopup.set(this.textoError(e, 'guardar'));

    if (this.modo() === 'crear') {
      this.servicio.crear(datos).subscribe({ next: alExito, error: alError });
    } else {
      this.servicio.actualizar(this.idEditando, datos).subscribe({ next: alExito, error: alError });
    }
  }

  eliminar(fila: Mascota): void {
    if (!confirm(`¿Eliminar a "${fila.nombre}"?`)) {
      return;
    }
    this.servicio.eliminar(fila.id).subscribe({
      next: () => this.cargar(),
      error: (e: HttpErrorResponse) => this.fallo(e, 'eliminar'),
    });
  }

  private textoError(e: HttpErrorResponse, contexto: Contexto): string {
    switch (e.status) {
      case 0:
        return `No hubo conexión con la API (${environment.apiBaseUrl}). Asegúrate de que el backend esté encendido.`;
      case 404:
        if (contexto === 'listar') return 'No hay registros';
        if (contexto === 'buscar') return 'No encontrado';
        return 'La mascota ya no existe';
      case 422:
        return 'Revisa los datos enviados.';
      default:
        return `Error inesperado (código ${e.status}).`;
    }
  }
}