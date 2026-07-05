/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Director {
  visible?: boolean;
  NOMBRE?: string;
  Nombre?: string; // Standardize name keys
  "NUMERO DE CONTACTO"?: string;
  "CORREO"?: string;
  Periodo?: string;
  Fotografias?: string[];
}

export interface DepartamentoAcademico {
  visible?: boolean;
  NOMBRE?: string;
  Director?: Director[];
}

export interface Documento {
  titulo: string;
  url: string;
}

export interface PersonalInfo {
  visible?: boolean;
  NOMBRE?: string;
  "NUMERO DE CONTACTO"?: string;
  "CORREO"?: string;
}

export type Responsable = PersonalInfo;
export type PersonalTecnico = PersonalInfo;

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
  AFORO?: string;
  COMENTARIOS?: string;
  Fotografias?: string[];
  "RESPONSABLE DEL LABORATORIO O TALLER"?: Responsable;
  "PERSONAL TÉCNICO"?: PersonalTecnico[];
  "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"?: Responsable;
  documentos?: Documento[];
}

export interface InfoEquipo {
  "Denominacion Patrimonial"?: string;
  "Tipo de equipo:"?: string;
  Fabricante?: string;
  Marca?: string;
  Modelo?: string;
  Dimensiones?: string;
  "Codigo Inventario Equipo"?: string;
  "FECHA DE ADQUISICIÓN"?: string;
  "MODO DE ADQUISICIÓN"?: string;
  Ubicación?: string;
}

export type InfoEquipoDetalle = InfoEquipo;

export interface Caracteristica {
  Caracteristica?: string;
  Descripcion?: string;
}

export interface MantenimientoItem {
  visible?: boolean;
  descripcion?: {
    title?: string;
    Prioridad?: number;
    contenido?: string[];
  };
  "MONTO REF"?: {
    currency?: string;
    amount?: string;
  };
  responsable?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export type MantenimientoTask = MantenimientoItem;

export interface MantenimientoCron {
  enCadaUso?: MantenimientoItem[];
  semanal?: MantenimientoItem[];
  quincenal?: MantenimientoItem[];
  mensual?: MantenimientoItem[];
  bimestral?: MantenimientoItem[];
  trimestral?: MantenimientoItem[];
  semestral?: MantenimientoItem[];
  anual?: MantenimientoItem[];
  [key: string]: MantenimientoItem[] | undefined;
}

export type MantenimientoFrecuencia = MantenimientoCron;

export interface MantenimientoInfo {
  visible?: boolean;
  preventivo?: MantenimientoCron;
  correctivo?: MantenimientoCron;
}

export interface ProcedimientoMantenimiento {
  visible?: boolean;
  "Principio de Operacion"?: string;
  "Instalaciones Requeridas"?: string;
  Partes?: string;
  mantenimiento?: MantenimientoInfo;
}

export interface HojaDeVidaMantenimiento {
  visible?: boolean;
  Nro?: number;
  "Actividad realizada"?: string;
  Fecha?: string;
  fechaFin?: string;
  Responsable?: string;
  Observaciones?: string;
  Fotografias?: string[];
  documentos?: Documento[];
}

export type MantenimientoLog = HojaDeVidaMantenimiento;

export interface HojaDeVidaEquipo {
  visible?: boolean;
  infoEquipo?: {
    "Codigo Inventario Equipo"?: string;
    "FECHA DE ADQUISICIÓN"?: string;
    "MODO DE ADQUISICIÓN"?: string;
    Ubicación?: string;
    "N° de serie"?: string;
    "Codigo Patrimonial"?: string;
    "Año Fabricación"?: string;
    "Estado de conservación"?: string;
    "Estado de uso"?: string;
  };
  mantenimientos?: HojaDeVidaMantenimiento[];
  nota?: string;
  ultimaActualizacion?: {
    year?: number;
    month?: number;
    day?: number;
  };
  HechoPor?: string;
  RevisadoPor?: string;
  documentos?: Documento[];
}

export interface Equipo {
  visible?: boolean;
  "Nº DE EQUIPOS"?: string;
  "NOMBRE DEL EQUIPO"?: string;
  COMENTARIOS?: string;
  infoEquipo?: InfoEquipo;
  Fotografias?: string[];
  caracteristicas?: Caracteristica[];
  ProcedimientoMantenimiento?: ProcedimientoMantenimiento;
  HojasDeVidaEquipos?: HojaDeVidaEquipo[];
  documentos?: Documento[];
}

export interface Software {
  visible?: boolean;
  "Nº DE LICENCIAS"?: string;
  VERSIÓN?: string;
  "NOMBRE DEL SOFTWARE"?: string;
  "TIPO DE LICENCIA"?: string;
  Fotografias?: string[];
  COMENTARIOS?: string;
  documentos?: Documento[];
}

export interface Lab {
  visible?: boolean;
  infoAmbiente: InfoAmbiente;
  equipos?: Equipo[];
  software?: Software[];
}

export interface Contacto {
  visible?: boolean;
  enlaces?: Documento[];
}

export interface EpitData {
  "NOMBRE DE LA UNIVERSIDAD"?: string;
  "ABREVIATURA UNIVERSIDAD"?: string;
  FACULTAD?: string;
  ESCUELA?: string;
  "PROGRAMA DE ESTUDIOS"?: string;
  "ABREVIATURA PROGRAMA DE ESTUDIOS"?: string;
  "CODIGO PROGRAMA"?: string;
  "DIRECTOR DEL PROGRAMA DE ESTUDIOS"?: Director[] | string;
  "DEPARTAMENTO ACADÉMICO"?: DepartamentoAcademico | string;
  "DIRECTOR DEL DEPARTAMENTO ACADÉMICO"?: string; // Support for legacy key in types
  "CODIGO LOCAL"?: string;
  Fotografias?: string[];
  documentos?: Documento[];
  labs: Lab[];
  contacto?: Contacto;
}

export type UniversityData = EpitData;

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';

// Navigation Types
export type ViewType = 'DASHBOARD' | 'LABS_LIST' | 'LAB_DETAIL' | 'SETTINGS' | 'ALL_EQUIPMENT' | 'ALL_SOFTWARE' | 'ALL_PERSONNEL' | 'MAINTENANCE_PLAN' | 'MAINTENANCE_LOGS';

/**
 * Normalizes input data (supporting legacy string fields and slightly different property names)
 * into a clean, modern EpitData structure.
 */
export function normalizeData(input: any): EpitData {
  if (!input) {
    return {
      "NOMBRE DE LA UNIVERSIDAD": "",
      "ABREVIATURA UNIVERSIDAD": "",
      FACULTAD: "",
      ESCUELA: "",
      "PROGRAMA DE ESTUDIOS": "",
      "ABREVIATURA PROGRAMA DE ESTUDIOS": "",
      "CODIGO PROGRAMA": "",
      "DIRECTOR DEL PROGRAMA DE ESTUDIOS": [],
      "DEPARTAMENTO ACADÉMICO": { visible: true, NOMBRE: "", Director: [] },
      "CODIGO LOCAL": "",
      Fotografias: [],
      documentos: [],
      labs: [],
      contacto: { visible: true, enlaces: [] }
    };
  }

  const data = typeof input === "string" ? JSON.parse(input) : input;

  // 1. Convert DIRECTOR DEL PROGRAMA DE ESTUDIOS
  let directors: Director[] = [];
  if (Array.isArray(data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"])) {
    directors = data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"].map((d: any) => {
      if (typeof d === "string") {
        return { visible: true, NOMBRE: d, Nombre: d };
      }
      return {
        visible: d.visible !== false,
        NOMBRE: d.NOMBRE || d.Nombre || "",
        Nombre: d.Nombre || d.NOMBRE || "",
        "NUMERO DE CONTACTO": d["NUMERO DE CONTACTO"] || "",
        CORREO: d.CORREO || "",
        Periodo: d.Periodo || "",
        Fotografias: Array.isArray(d.Fotografias) ? d.Fotografias : []
      };
    });
  } else if (typeof data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"] === "string" && data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"].trim() !== "") {
    directors = [{
      visible: true,
      NOMBRE: data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"],
      Nombre: data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"]
    }];
  }

  // 2. Convert DEPARTAMENTO ACADÉMICO
  let dept: DepartamentoAcademico = { visible: true, NOMBRE: "", Director: [] };
  if (data["DEPARTAMENTO ACADÉMICO"]) {
    if (typeof data["DEPARTAMENTO ACADÉMICO"] === "string") {
      dept = {
        visible: true,
        NOMBRE: data["DEPARTAMENTO ACADÉMICO"],
        Director: []
      };
    } else {
      const d = data["DEPARTAMENTO ACADÉMICO"];
      dept = {
        visible: d.visible !== false,
        NOMBRE: d.NOMBRE || "",
        Director: Array.isArray(d.Director) ? d.Director.map((dir: any) => {
          if (typeof dir === "string") return { visible: true, NOMBRE: dir, Nombre: dir };
          return {
            visible: dir.visible !== false,
            NOMBRE: dir.NOMBRE || dir.Nombre || "",
            Nombre: dir.Nombre || dir.NOMBRE || "",
            "NUMERO DE CONTACTO": dir["NUMERODE CONTACTO"] || dir["NUMERO DE CONTACTO"] || "",
            CORREO: dir.CORREO || "",
            Periodo: dir.Periodo || "",
            Fotografias: Array.isArray(dir.Fotografias) ? dir.Fotografias : []
          };
        }) : []
      };
    }
  }

  // Support legacy DIRECTOR DEL DEPARTAMENTO ACADÉMICO key if dept doesn't have a director
  if ((!dept.Director || dept.Director.length === 0) && data["DIRECTOR DEL DEPARTAMENTO ACADÉMICO"] && typeof data["DIRECTOR DEL DEPARTAMENTO ACADÉMICO"] === "string" && data["DIRECTOR DEL DEPARTAMENTO ACADÉMICO"].trim() !== "") {
    dept.Director = [{
      visible: true,
      NOMBRE: data["DIRECTOR DEL DEPARTAMENTO ACADÉMICO"],
      Nombre: data["DIRECTOR DEL DEPARTAMENTO ACADÉMICO"]
    }];
  }

  // Ensure labs have all expected properties and are safe
  const labs = Array.isArray(data.labs) ? data.labs.map((lab: any) => {
    // Info Ambiente
    const info = lab.infoAmbiente || {};
    const normalizedInfo: InfoAmbiente = {
      "NUMERO DE LABORATORIO O TALLER": info["NUMERO DE LABORATORIO O TALLER"] || "",
      "CÓDIGO DE LABORATORIO O TALLER": info["CÓDIGO DE LABORATORIO O TALLER"] || "",
      "NOMBRE DEL LABORATORIO O TALLER": info["NOMBRE DEL LABORATORIO O TALLER"] || "",
      "TIPO DE LABORATORIO O TALLER": info["TIPO DE LABORATORIO O TALLER"] || "",
      "CODIGO PATRIMONIO AMBIENTE": info["CODIGO PATRIMONIO AMBIENTE"] || info["CÓDIGO PATRIMONIO AMBIENTE"] || "",
      "REFERENCIA DE UBICACIÓN": info["REFERENCIA DE UBICACIÓN"] || "",
      "PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER": Array.isArray(info["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"]) ? info["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"] : [],
      "CANTIDAD DE PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER": info["CANTIDAD DE PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"] || "",
      "SERVICIO DE INTERNET (SI/NO)": info["SERVICIO DE INTERNET (SI/NO)"] || "",
      "ÁREA (m2)": info["ÁREA (m2)"] || info["AREA (m2)"] || "",
      AFORO: info.AFORO || info.aforo || "",
      COMENTARIOS: info.COMENTARIOS || info.comentarios || "",
      Fotografias: Array.isArray(info.Fotografias) ? info.Fotografias : (Array.isArray(info.fotografias) ? info.fotografias : []),
      documentos: Array.isArray(info.documentos) ? info.documentos : []
    };

    // Responsable and Personal Tecnico normalizations
    if (info["RESPONSABLE DEL LABORATORIO O TALLER"]) {
      const resp = info["RESPONSABLE DEL LABORATORIO O TALLER"];
      normalizedInfo["RESPONSABLE DEL LABORATORIO O TALLER"] = {
        visible: resp.visible !== false,
        NOMBRE: resp.NOMBRE || resp.Nombre || "",
        "NUMERO DE CONTACTO": resp["NUMERO DE CONTACTO"] || "",
        CORREO: resp.CORREO || ""
      };
    }
    if (info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"]) {
      const cbc = info["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"];
      normalizedInfo["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"] = {
        visible: cbc.visible !== false,
        NOMBRE: cbc.NOMBRE || cbc.Nombre || "",
        "NUMERO DE CONTACTO": cbc["NUMERO DE CONTACTO"] || "",
        CORREO: cbc.CORREO || ""
      };
    }
    if (Array.isArray(info["PERSONAL TÉCNICO"])) {
      normalizedInfo["PERSONAL TÉCNICO"] = info["PERSONAL TÉCNICO"].map((tech: any) => ({
        visible: tech.visible !== false,
        NOMBRE: tech.NOMBRE || tech.Nombre || "",
        "NUMERO DE CONTACTO": tech["NUMERO DE CONTACTO"] || "",
        CORREO: tech.CORREO || ""
      }));
    }

    // Equipos
    const equipos = Array.isArray(lab.equipos) ? lab.equipos.map((eq: any) => {
      const infoEq = eq.infoEquipo || {};
      const normalizedInfoEq: InfoEquipo = {
        "Denominacion Patrimonial": infoEq["Denominacion Patrimonial"] || infoEq["Denominación Patrimonial"] || "",
        "Tipo de equipo:": infoEq["Tipo de equipo:"] || infoEq["Tipo de equipo"] || "",
        Fabricante: infoEq.Fabricante || "",
        Marca: infoEq.Marca || "",
        Modelo: infoEq.Modelo || "",
        Dimensiones: infoEq.Dimensiones || "",
        "Codigo Inventario Equipo": infoEq["Codigo Inventario Equipo"] || infoEq["Código Inventario Equipo"] || "",
        "FECHA DE ADQUISICIÓN": infoEq["FECHA DE ADQUISICIÓN"] || infoEq["FECHA DE ADQUISICION"] || "",
        "MODO DE ADQUISICIÓN": infoEq["MODO DE ADQUISICIÓN"] || infoEq["MODO DE ADQUISICION"] || "",
        Ubicación: infoEq.Ubicación || infoEq.Ubicacion || ""
      };

      // Mantenimiento
      let procedimiento: ProcedimientoMantenimiento | undefined = undefined;
      if (eq.ProcedimientoMantenimiento) {
        const pm = eq.ProcedimientoMantenimiento;
        procedimiento = {
          visible: pm.visible !== false,
          "Principio de Operacion": pm["Principio de Operacion"] || pm["Principio de Operación"] || "",
          "Instalaciones Requeridas": pm["Instalaciones Requeridas"] || "",
          Partes: pm.Partes || "",
          mantenimiento: pm.mantenimiento ? {
            visible: pm.mantenimiento.visible !== false,
            preventivo: pm.mantenimiento.preventivo,
            correctivo: pm.mantenimiento.correctivo
          } : undefined
        };
      }

      // Hojas de vida
      const hojasDeVida = Array.isArray(eq.HojasDeVidaEquipos) ? eq.HojasDeVidaEquipos.map((hv: any) => {
        const hvInfo = hv.infoEquipo || {};
        return {
          visible: hv.visible !== false,
          infoEquipo: {
            "Codigo Inventario Equipo": hvInfo["Codigo Inventario Equipo"] || "",
            "FECHA DE ADQUISICIÓN": hvInfo["FECHA DE ADQUISICIÓN"] || "",
            "MODO DE ADQUISICIÓN": hvInfo["MODO DE ADQUISICIÓN"] || "",
            Ubicación: hvInfo.Ubicación || "",
            "N° de serie": hvInfo["N° de serie"] || hvInfo["Nº de serie"] || "",
            "Codigo Patrimonial": hvInfo["Codigo Patrimonial"] || "",
            "Año Fabricación": hvInfo["Año Fabricación"] || hvInfo["Año de fabricación"] || "",
            "Estado de conservación": hvInfo["Estado de conservación"] || "",
            "Estado de uso": hvInfo["Estado de uso"] || ""
          },
          mantenimientos: Array.isArray(hv.mantenimientos) ? hv.mantenimientos.map((m: any) => ({
            visible: m.visible !== false,
            Nro: m.Nro || 0,
            "Actividad realizada": m["Actividad realizada"] || "",
            Fecha: m.Fecha || "",
            fechaFin: m.fechaFin || "",
            Responsable: m.Responsable || "",
            Observaciones: m.Observaciones || "",
            Fotografias: Array.isArray(m.Fotografias) ? m.Fotografias : [],
            documentos: Array.isArray(m.documentos) ? m.documentos : []
          })) : [],
          nota: hv.nota || "",
          ultimaActualizacion: hv.ultimaActualizacion || { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() },
          HechoPor: hv.HechoPor || "",
          RevisadoPor: hv.RevisadoPor || ""
        };
      }) : [];

      return {
        visible: eq.visible !== false,
        "Nº DE EQUIPOS": eq["Nº DE EQUIPOS"] || eq["N° DE EQUIPOS"] || "",
        "NOMBRE DEL EQUIPO": eq["NOMBRE DEL EQUIPO"] || "",
        COMENTARIOS: eq.COMENTARIOS || eq.comentarios || "",
        infoEquipo: normalizedInfoEq,
        Fotografias: Array.isArray(eq.Fotografias) ? eq.Fotografias : [],
        caracteristicas: Array.isArray(eq.caracteristicas) ? eq.caracteristicas.map((c: any) => ({
          Caracteristica: c.Caracteristica || "",
          Descripcion: c.Descripcion || ""
        })) : [],
        ProcedimientoMantenimiento: procedimiento,
        HojasDeVidaEquipos: hojasDeVida,
        documentos: Array.isArray(eq.documentos) ? eq.documentos : []
      };
    }) : [];

    // Software
    const software = Array.isArray(lab.software) ? lab.software.map((sw: any) => ({
      visible: sw.visible !== false,
      "Nº DE LICENCIAS": sw["Nº DE LICENCIAS"] || sw["N° DE LICENCIAS"] || "",
      VERSIÓN: sw.VERSIÓN || sw.Version || sw.version || "",
      "NOMBRE DEL SOFTWARE": sw["NOMBRE DEL SOFTWARE"] || "",
      "TIPO DE LICENCIA": sw["TIPO DE LICENCIA"] || "",
      Fotografias: Array.isArray(sw.Fotografias) ? sw.Fotografias : [],
      COMENTARIOS: sw.COMENTARIOS || sw.comentarios || "",
      documentos: Array.isArray(sw.documentos) ? sw.documentos : []
    })) : [];

    return {
      visible: lab.visible !== false,
      infoAmbiente: normalizedInfo,
      equipos,
      software
    };
  }) : [];

  return {
    "NOMBRE DE LA UNIVERSIDAD": data["NOMBRE DE LA UNIVERSIDAD"] || "",
    "ABREVIATURA UNIVERSIDAD": data["ABREVIATURA UNIVERSIDAD"] || "",
    FACULTAD: data.FACULTAD || "",
    ESCUELA: data.ESCUELA || "",
    "PROGRAMA DE ESTUDIOS": data["PROGRAMA DE ESTUDIOS"] || "",
    "ABREVIATURA PROGRAMA DE ESTUDIOS": data["ABREVIATURA PROGRAMA DE ESTUDIOS"] || data["ABREVIATURA PROGRAMA"] || "",
    "CODIGO PROGRAMA": data["CODIGO PROGRAMA"] || "",
    "DIRECTOR DEL PROGRAMA DE ESTUDIOS": directors,
    "DEPARTAMENTO ACADÉMICO": dept,
    "CODIGO LOCAL": data["CODIGO LOCAL"] || "",
    Fotografias: Array.isArray(data.Fotografias) ? data.Fotografias : [],
    documentos: Array.isArray(data.documentos) ? data.documentos : [],
    labs: labs,
    contacto: data.contacto ? {
      visible: data.contacto.visible !== false,
      enlaces: Array.isArray(data.contacto.enlaces) ? data.contacto.enlaces : []
    } : { visible: true, enlaces: [] }
  };
}