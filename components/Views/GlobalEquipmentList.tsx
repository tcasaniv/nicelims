import React from 'react';
import { Lab, Equipo } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Cpu, MapPin } from 'lucide-react';

interface GlobalEquipmentListProps {
  labs: Lab[];
}

interface EquipmentGroup {
    name: string;
    totalQuantity: number;
    totalUnits: number;
    locations: {
        labCode: string;
        labName: string;
        brand: string;
        model: string;
        quantity: number;
    }[];
}

export const GlobalEquipmentList: React.FC<GlobalEquipmentListProps> = ({ labs }) => {
  // Group equipment by name
  const groupedEquipment = labs.reduce((acc, lab) => {
      (lab.equipos || []).forEach(eq => {
          const rawName = eq["NOMBRE DEL EQUIPO"] || "Desconocido";
          const nameKey = rawName.trim().toUpperCase();

          if (!acc[nameKey]) {
              acc[nameKey] = {
                  name: rawName, // Keep the first casing found as display name
                  totalQuantity: 0,
                  totalUnits: 0,
                  locations: []
              };
          }

          const qty = parseInt(eq["Nº DE EQUIPOS"] || "0", 10);
          const units = (eq.HojasDeVidaEquipos || []).length;

          acc[nameKey].totalQuantity += isNaN(qty) ? 0 : qty;
          acc[nameKey].totalUnits += units;
          acc[nameKey].locations.push({
              labCode: lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C",
              labName: lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre",
              brand: eq.infoEquipo?.Marca || "-",
              model: eq.infoEquipo?.Modelo || "-",
              quantity: isNaN(qty) ? 0 : qty
          });
      });
      return acc;
  }, {} as Record<string, EquipmentGroup>);

  const equipmentList = Object.values(groupedEquipment).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Equipos Globales</h2>
            <p className="text-sm text-zinc-500">Listado consolidado por tipo de equipo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {equipmentList.length === 0 ? (
           <div className="text-center py-10 text-zinc-500">No hay equipos registrados en el sistema.</div>
        ) : (
            equipmentList.map((item, idx) => (
                <Card key={idx} className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                                <Cpu size={24}/>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded">
                                            {item.totalQuantity} Total
                                        </div>
                                        <div className="text-xs text-zinc-400 mt-1">{item.totalUnits} inventariados</div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ubicaciones y Variantes:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {item.locations.map((loc, locIdx) => (
                                            <div key={locIdx} className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-100 dark:border-zinc-700 text-sm flex gap-2 items-start">
                                                <MapPin size={14} className="mt-0.5 text-zinc-400 shrink-0"/>
                                                <div>
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{loc.labCode}</span>
                                                    <span className="mx-1 text-zinc-300">|</span>
                                                    <span className="text-zinc-600 dark:text-zinc-300">{loc.brand} {loc.model}</span>
                                                    <div className="text-xs text-zinc-400 mt-0.5">Cant: {loc.quantity}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
};