import React, { useState, useMemo } from 'react';
import { Lab } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Save, MapPin, Search, Filter, ArrowUpDown, X } from 'lucide-react';

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

type SortOption = 'NAME_ASC' | 'NAME_DESC' | 'LIC_ASC' | 'LIC_DESC';

export const GlobalSoftwareList: React.FC<GlobalSoftwareListProps> = ({ labs }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLab, setFilterLab] = useState("");
  const [sortKey, setSortKey] = useState<SortOption>('NAME_ASC');

   // Helper to extract unique labs for filter dropdown
  const availableLabs = useMemo(() => {
      const unique = new Map<string, string>();
      labs.forEach(l => {
         const code = l.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"];
         const name = l.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"];
         if(code && (l.software || []).length > 0) unique.set(code, name || "Sin Nombre");
      });
      return Array.from(unique.entries());
  }, [labs]);

  const processedList = useMemo(() => {
    const grouped = labs.reduce((acc, lab) => {
        const labCode = lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C";
        
        // Filter by Lab
        if (filterLab && labCode !== filterLab) return acc;

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
                labCode: labCode,
                labName: lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre",
                version: sw["VERSIÓN"] || "-",
                licenses: isNaN(lic) ? 0 : lic,
                type: sw["TIPO DE LICENCIA"] || "Desconocido"
            });
        });
        return acc;
    }, {} as Record<string, SoftwareGroup>);

    let list = Object.values(grouped);

    // Search
    if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase();
        list = list.filter(item => 
            item.name.toLowerCase().includes(lower) ||
            item.locations.some(loc => loc.version.toLowerCase().includes(lower) || loc.type.toLowerCase().includes(lower))
        );
    }

    // Sort
    list.sort((a, b) => {
        if (sortKey === 'NAME_ASC') return a.name.localeCompare(b.name);
        if (sortKey === 'NAME_DESC') return b.name.localeCompare(a.name);
        if (sortKey === 'LIC_ASC') return a.totalLicenses - b.totalLicenses;
        if (sortKey === 'LIC_DESC') return b.totalLicenses - a.totalLicenses;
        return 0;
    });

    return list;
  }, [labs, searchTerm, filterLab, sortKey]);

  const toggleSort = () => {
    if (sortKey === 'NAME_ASC') setSortKey('NAME_DESC');
    else if (sortKey === 'NAME_DESC') setSortKey('LIC_DESC');
    else if (sortKey === 'LIC_DESC') setSortKey('LIC_ASC');
    else setSortKey('NAME_ASC');
  };
  
  const getSortLabel = () => {
      switch(sortKey) {
          case 'NAME_ASC': return "Nombre A-Z";
          case 'NAME_DESC': return "Nombre Z-A";
          case 'LIC_DESC': return "Más Licencias";
          case 'LIC_ASC': return "Menos Licencias";
      }
  };

  const clearFilters = () => {
      setSearchTerm("");
      setFilterLab("");
      setSortKey('NAME_ASC');
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Software Global</h2>
            <p className="text-sm text-zinc-500">Consolidado de licencias y versiones</p>
        </div>
      </div>

       <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input 
                  placeholder="Buscar por nombre, versión..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
              />
          </div>
          <div className="flex gap-2">
               <div className="relative min-w-[200px]">
                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <select 
                        className="w-full h-10 pl-9 pr-3 rounded-md border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 appearance-none"
                        value={filterLab}
                        onChange={(e) => setFilterLab(e.target.value)}
                    >
                        <option value="">Todos los Laboratorios</option>
                        {availableLabs.map(([code, name]) => (
                            <option key={code} value={code}>{code} - {name}</option>
                        ))}
                    </select>
               </div>
               <Button variant="secondary" onClick={toggleSort} className="gap-2 min-w-[140px]" title="Ordenar">
                   <ArrowUpDown size={16}/>
                   <span className="text-xs">{getSortLabel()}</span>
               </Button>
               {(searchTerm || filterLab || sortKey !== 'NAME_ASC') && (
                   <Button variant="ghost" onClick={clearFilters} className="px-2 text-zinc-500" title="Limpiar filtros">
                       <X size={18}/>
                   </Button>
               )}
          </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {processedList.length === 0 ? (
           <div className="text-center py-10 text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800">
               {searchTerm || filterLab ? "No se encontraron programas con los filtros actuales." : "No hay software registrado."}
           </div>
        ) : (
            processedList.map((item, idx) => (
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