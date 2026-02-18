import React from 'react';
import { Lab, Software } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Save, MapPin, Key } from 'lucide-react';

interface GlobalSoftwareListProps {
  labs: Lab[];
}

interface SoftwareGroup {
    name: string;
    totalLicenses: number;
    locations: {
        labCode: string;
        labName: string;
        version: string;
        licenses: number;
        type: string;
    }[];
}

export const GlobalSoftwareList: React.FC<GlobalSoftwareListProps> = ({ labs }) => {
  // Group software by name
  const groupedSoftware = labs.reduce((acc, lab) => {
      (lab.software || []).forEach(sw => {
          const rawName = sw["NOMBRE DEL SOFTWARE"] || "Desconocido";
          const nameKey = rawName.trim().toUpperCase();

          if (!acc[nameKey]) {
              acc[nameKey] = {
                  name: rawName,
                  totalLicenses: 0,
                  locations: []
              };
          }

          const lic = parseInt(sw["Nº DE LICENCIAS"] || "0", 10);

          acc[nameKey].totalLicenses += isNaN(lic) ? 0 : lic;
          acc[nameKey].locations.push({
              labCode: lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C",
              labName: lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre",
              version: sw["VERSIÓN"] || "-",
              licenses: isNaN(lic) ? 0 : lic,
              type: sw["TIPO DE LICENCIA"] || "Desconocido"
          });
      });
      return acc;
  }, {} as Record<string, SoftwareGroup>);

  const softwareList = Object.values(groupedSoftware).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Software Global</h2>
            <p className="text-sm text-zinc-500">Consolidado de licencias y versiones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {softwareList.length === 0 ? (
           <div className="text-center py-10 text-zinc-500">No hay software registrado en el sistema.</div>
        ) : (
            softwareList.map((item, idx) => (
                <Card key={idx} className="hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                                <Save size={24}/>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                                    <div className="text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                                        {item.totalLicenses} Licencias
                                    </div>
                                </div>
                                
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Instalaciones:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {item.locations.map((loc, locIdx) => (
                                            <div key={locIdx} className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-100 dark:border-zinc-700 text-sm space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-zinc-400"/>
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{loc.labCode}</span>
                                                </div>
                                                <div className="flex justify-between text-zinc-600 dark:text-zinc-300 text-xs pl-6">
                                                    <span>v{loc.version}</span>
                                                    <span>{loc.licenses} lic.</span>
                                                </div>
                                                 <div className="pl-6 text-xs text-zinc-400 italic truncate" title={loc.type}>
                                                    {loc.type}
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