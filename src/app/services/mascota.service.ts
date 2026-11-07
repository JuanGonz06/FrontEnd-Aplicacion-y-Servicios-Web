import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroment';
import { Mascota, MascotaCreate, MascotaUpdate } from '../models/mascota.model';

@Injectable({ providedIn: 'root' })
export class MascotaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/mascotas`;

  listar(): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(`${this.base}/`);
  }

  obtener(id: number): Observable<Mascota> {
    return this.http.get<Mascota>(`${this.base}/${id}`);
  }

  crear(datos: MascotaCreate): Observable<Mascota> {
    return this.http.post<Mascota>(`${this.base}/`, datos);
  }

  actualizar(id: number, datos: MascotaUpdate): Observable<Mascota> {
    return this.http.put<Mascota>(`${this.base}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}