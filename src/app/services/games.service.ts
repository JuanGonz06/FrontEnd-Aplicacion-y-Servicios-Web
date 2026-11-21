import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/enviroment';
import { GamesModel } from '../models/games.model';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private apiUrl = `${environment.apiBaseUrl}/videojuegos`;

  constructor(private http: HttpClient) {}

  // 1. GET: Listar la colección completa
  getAll(): Observable<GamesModel[]> {
    return this.http.get<GamesModel[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // 2. GET: Consultar un registro por ID
  getById(id: number): Observable<GamesModel> {
    return this.http.get<GamesModel>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // 3. POST: Crear un nuevo juego
  create(game: GamesModel): Observable<GamesModel> {
    return this.http.post<GamesModel>(this.apiUrl, game).pipe(
      catchError(this.handleError)
    );
  }

  // 4. PUT: Editar un juego existente
  update(id: number, game: GamesModel): Observable<GamesModel> {
    return this.http.put<GamesModel>(`${this.apiUrl}/${id}`, game).pipe(
      catchError(this.handleError)
    );
  }

  // 5. DELETE: Eliminar un juego
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' }).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores cuando el backend está apagado
  private handleError(error: any) {
    if (error.status === 0) {
      console.error('No hubo conexión con la API (Backend apagado).');
    }
    return throwError(() => error);
  }
}