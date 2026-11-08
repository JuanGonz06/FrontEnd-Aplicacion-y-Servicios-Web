export interface GamesModel {
  id?: number;
  titulo: string;
  genero: string;
  desarrollador?: string;
  precio: number;
  stock: number;
  disponible: boolean;
}