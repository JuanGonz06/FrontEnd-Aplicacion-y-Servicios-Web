import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.html',
  styleUrl: './producto.css'
})
export class Product implements OnInit {
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef); // Detector de cambios

  productos: Producto[] = [];
  productoSeleccionado: Producto = this.crearProductoVacio();
  modoEdicion: boolean = false;
  
  // Variable para controlar la ventana emergente (Modal)
  mostrarModal: boolean = false;

  idBusqueda: number | null = null;
  productoFiltrado: Producto | null = null;
  mensajeError: string = '';
  conexionActiva: boolean = true;

  ngOnInit(): void {
    this.cargarProductos();
  }

  // Listar la colección (GET /productos) al cargar la página
  cargarProductos(): void {
    this.productoService.getAll().subscribe({
      next: (data) => {
        // Ordenamos los productos por ID de menor a mayor
        this.productos = data.sort((a, b) => (a.id && b.id) ? a.id - b.id : 0);

        this.conexionActiva = true;
        this.mensajeError = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        if (err.status === 0) {
          this.conexionActiva = false;
          this.mensajeError = 'No hubo conexión con la API (Backend apagado).';
        }
        this.cdr.detectChanges();
      }
    });
  }

  // Consultar uno por ID (GET /productos/{id})
  buscarPorId(): void {
    if (!this.idBusqueda) {
      this.cargarProductos();
      this.productoFiltrado = null;
      return;
    }

    this.productoService.getById(this.idBusqueda).subscribe({
      next: (data) => {
        if (data) {
          this.productoFiltrado = data;
          this.mensajeError = '';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.productoFiltrado = null;
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

  // Crear (POST) o Editar (PUT)
  guardarProducto(): void {
    if (this.modoEdicion && this.productoSeleccionado.id) {
      this.productoService.update(this.productoSeleccionado.id, this.productoSeleccionado).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarModal(); // <-- Cierra el modal y limpia el formulario automáticamente al actualizar
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al actualizar', err)
      });
    } else {
      this.productoService.create(this.productoSeleccionado).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarModal(); // <-- Cierra el modal y limpia el formulario automáticamente al crear
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al crear', err)
      });
    }
  }

  // Abrir modal en modo Creación
  abrirModalCrear(): void {
    this.resetFormulario(); 
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  // Abrir modal en modo Edición cargando los datos del producto seleccionado
 editar(prod: Producto): void {
  // Clonamos el objeto para no modificar la tabla en tiempo real mientras escribes
  this.productoSeleccionado = { ...prod };
  this.modoEdicion = true;
  this.mostrarModal = true; 
  this.cdr.detectChanges(); // <-- Forzamos a Angular a abrir el modal al instante
}

  // Cerrar modal y limpiar campos
  cerrarModal(): void {
    this.mostrarModal = false;
    this.resetFormulario();
    this.cdr.detectChanges(); 
  }

  // Eliminar (DELETE /productos/{id}) con confirmación y actualización a la primera
  eliminar(id: number | null | undefined): void {
    if (!id) {
      console.warn('ID inválido para eliminar');
      return;
    }

    const confirmado = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (!confirmado) {
      return;
    }

    this.productoService.delete(id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== id);
        if (this.productoFiltrado && this.productoFiltrado.id === id) {
          this.productoFiltrado = null;
          this.idBusqueda = null;
        }
        this.cargarProductos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 200 || err.status === 204) {
          this.productos = this.productos.filter(p => p.id !== id);
          if (this.productoFiltrado && this.productoFiltrado.id === id) {
            this.productoFiltrado = null;
            this.idBusqueda = null;
          }
          this.cargarProductos();
        } else {
          console.error('Error al eliminar', err);
          this.cargarProductos();
        }
        this.cdr.detectChanges();
      }
    });
  }

  resetFormulario(): void {
    this.productoSeleccionado = this.crearProductoVacio();
    this.modoEdicion = false;
  }

  private crearProductoVacio(): Producto {
    return {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      disponible: true
    };
  }
}