// Root Object
export interface UniversityData {
  "NOMBRE DE LA UNIVERSIDAD"?: string;
  "ABREVIATURA UNIVERSIDAD"?: string;
  "FACULTAD"?: string;
  "ESCUELA"?: string;
  "PROGRAMA DE ESTUDIOS"?: string;
  "CODIGO PROGRAMA"?: string;
  "DIRECTOR DEL PROGRAMA DE ESTUDIOS"?: string;
  "DEPARTAMENTO ACADÉMICO"?: string;
  "DIRECTOR DEL DEPARTAMENTO ACADÉMICO"?: string;
  "CODIGO LOCAL"?: string;
  labs: Lab[];
}

// Lab Structure
export interface Lab {
  infoAmbiente: InfoAmbiente;
  equipos?: Equipo[];
  software?: Software[];
}

export interface InfoAmbiente {
  "NUMERO DE LABORATORIO O TALLER"?: string;
  "CÓDIGO DE LABORATORIO O TALLER"?: string;
  "NOMBRE DEL LABORATORIO O TALLER"?: string;
  "TIPO DE LABORATORIO O TALLER"?: string;
  "CODIGO PATRIMONIO AMBIENTE"?: string;
  "REFERENCIA DE UBICACIÓN"?: string;
  "PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"?: string[];
  "CANTIDAD DE PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"?: string;
  "SERVICIO DE INTERNET (SI/NO)"?: string;
  "ÁREA (m2)"?: string;
  "AFORO"?: string;
  "COMENTARIOS"?: string;
  "RESPONSABLE DEL LABORATORIO O TALLER"?: PersonalInfo;
  "PERSONAL TÉCNICO"?: PersonalInfo[];
  "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"?: PersonalInfo;
  "Fotografias"?: string[];
  "documentos"?: Documento[];
}

export interface PersonalInfo {
  "NOMBRE"?: string;
  "NUMERO DE CONTACTO"?: string;
}

// Equipment Structure
export interface Equipo {
  "Nº DE EQUIPOS"?: string;
  "NOMBRE DEL EQUIPO"?: string;
  "COMENTARIOS"?: string;
  "infoEquipo"?: InfoEquipoDetalle;
  "Fotografias"?: string[];
  "caracteristicas"?: Caracteristica[];
  "documentos"?: Documento[];
  "ProcedimientoMantenimiento"?: ProcedimientoMantenimiento;
  "HojasDeVidaEquipos"?: HojaDeVidaEquipo[];
}

export interface Documento {
  titulo: string;
  url: string;
}

export interface InfoEquipoDetalle {
  "Denominacion Patrimonial"?: string;
  "Tipo de equipo:"?: string;
  "Fabricante"?: string;
  "Marca"?: string;
  "Modelo"?: string;
}

export interface Caracteristica {
  "Caracteristica"?: string;
  "Descripcion"?: string;
}

// Maintenance Structure
export interface ProcedimientoMantenimiento {
  "Principio de Operacion"?: string;
  "Instalaciones Requeridas"?: string;
  "Partes"?: string;
  "mantenimiento"?: {
    "preventivo"?: MantenimientoFrecuencia;
    "correctivo"?: MantenimientoFrecuencia;
  };
}

export interface MantenimientoFrecuencia {
  "enCadaUso"?: MantenimientoTask[];
  "semanal"?: MantenimientoTask[];
  "quincenal"?: MantenimientoTask[];
  "mensual"?: MantenimientoTask[];
  "bimestral"?: MantenimientoTask[];
  "trimestral"?: MantenimientoTask[];
  "semestral"?: MantenimientoTask[];
  "anual"?: MantenimientoTask[];
  [key: string]: MantenimientoTask[] | undefined;
}

export interface MantenimientoTask {
  "descripcion"?: {
    "title"?: string;
    "Prioridad"?: number;
    "contenido"?: string[];
  };
  "MONTO REF"?: {
    "currency"?: string;
    "amount"?: string;
  };
  "responsable"?: string;
}

// Lifecycle Structure
export interface HojaDeVidaEquipo {
  "infoEquipo"?: {
    "Codigo Inventario Equipo"?: string;
    "FECHA DE ADQUISICIÓN"?: string;
    "MODO DE ADQUISICIÓN"?: string;
    "Ubicación"?: string;
  };
  "mantenimientos"?: MantenimientoLog[];
  "nota"?: string;
  "ultimaActualizacion"?: {
    "year"?: number;
    "month"?: number;
    "day"?: number;
  };
  "HechoPor"?: string;
  "RevisadoPor"?: string;
}

export interface MantenimientoLog {
  "Nro"?: number;
  "Actividad realizada"?: string;
  "Fecha"?: string;
  "Responsable"?: string;
  "Observaciones"?: string;
  "Fotografias"?: string[];
}

// Software Structure
export interface Software {
  "Nº DE LICENCIAS"?: string;
  "VERSIÓN"?: string;
  "NOMBRE DEL SOFTWARE"?: string;
  "TIPO DE LICENCIA"?: string;
  "COMENTARIOS"?: string;
  "Fotografias"?: string[];
  "documentos"?: Documento[];
}

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';

// Navigation Types
export type ViewType = 'DASHBOARD' | 'LABS_LIST' | 'LAB_DETAIL' | 'SETTINGS' | 'ALL_EQUIPMENT' | 'ALL_SOFTWARE' | 'ALL_PERSONNEL' | 'MAINTENANCE_PLAN' | 'MAINTENANCE_LOGS';