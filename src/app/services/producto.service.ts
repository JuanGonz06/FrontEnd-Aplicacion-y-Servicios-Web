import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/enviroment';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiBaseUrl}/productos`;

  constructor(private http: HttpClient) {}

  // 1. GET: Listar la colección completa
  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // 2. GET: Consultar un registro por ID (para el filtro)
  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // 3. POST: Crear un nuevo producto
  create(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto).pipe(
      catchError(this.handleError)
    );
  }

  // 4. PUT: Editar un producto existente
  update(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto).pipe(
      catchError(this.handleError)
    );
  }


// 5. DELETE: Eliminar un producto
delete(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' }).pipe(
    catchError(this.handleError)
  );
}

  // Manejo de errores cuando el backend está apagado (Requisito clave del examen)
  private handleError(error: any) {
    if (error.status === 0) {
      console.error('No hubo conexión con la API (Backend apagado).');
    }
    return throwError(() => error);
  }
}