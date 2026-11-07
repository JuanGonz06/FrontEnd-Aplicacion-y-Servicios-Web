export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  edad: number;
  peso: number | null;
  vacunado: boolean;
}

export interface MascotaCreate {
  nombre: string;
  especie: string;
  raza?: string;
  edad: number;
  peso?: number;
  vacunado: boolean;
}

export type MascotaUpdate = Partial<MascotaCreate>;