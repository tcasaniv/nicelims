import React, { useState, useMemo } from 'react';
import { Lab } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Cpu, MapPin, Search, Filter, ArrowUpDown, X } from 'lucide-react';

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

type SortOption = 'NAME_ASC' | 'NAME_DESC' | 'QTY_ASC' | 'QTY_DESC';

export const GlobalEquipmentList: React.FC<GlobalEquipmentListProps> = ({ labs }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLab, setFilterLab] = useState("");
  const [sortKey, setSortKey] = useState<SortOption>('NAME_ASC');

  // Helper to extract unique labs for filter dropdown
  const availableLabs = useMemo(() => {
      const unique = new Map<string, string>();
      labs.forEach(l => {
         const code = l.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"];
         const name = l.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"];
         if(code && (l.equipos || []).length > 0) unique.set(code, name || "Sin Nombre");
      });
      return Array.from(unique.entries());
  }, [labs]);


  const processedList = useMemo(() => {
    // 1. Group equipment by name
    const grouped = labs.reduce((acc, lab) => {
        const labCode = lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C";
        
        // Filter by Lab Logic (Early filtering for performance)
        if (filterLab && labCode !== filterLab) return acc;

        (lab.equipos || []).forEach(eq => {
            const rawName = eq["NOMBRE DEL EQUIPO"] || "Desconocido";
            const nameKey = rawName.trim().toUpperCase();

            if (!acc[nameKey]) {
                acc[nameKey] = {
                    name: rawName,
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
                labCode: labCode,
                labName: lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre",
                brand: eq.infoEquipo?.Marca || "-",
                model: eq.infoEquipo?.Modelo || "-",
                quantity: isNaN(qty) ? 0 : qty
            });
        });
        return acc;
    }, {} as Record<string, EquipmentGroup>);

    let list = Object.values(grouped);

    // 2. Search Logic
    if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase();
        list = list.filter(item => 
            item.name.toLowerCase().includes(lower) ||
            item.locations.some(loc => 
                loc.brand.toLowerCase().includes(lower) || 
                loc.model.toLowerCase().includes(lower)
            )
        );
    }

    // 3. Sort Logic
    list.sort((a, b) => {
        if (sortKey === 'NAME_ASC') return a.name.localeCompare(b.name);
        if (sortKey === 'NAME_DESC') return b.name.localeCompare(a.name);
        if (sortKey === 'QTY_ASC') return a.totalQuantity - b.totalQuantity;
        if (sortKey === 'QTY_DESC') return b.totalQuantity - a.totalQuantity;
        return 0;
    });

    return list;
  }, [labs, searchTerm, filterLab, sortKey]);

  const toggleSort = () => {
    if (sortKey === 'NAME_ASC') setSortKey('NAME_DESC');
    else if (sortKey === 'NAME_DESC') setSortKey('QTY_DESC');
    else if (sortKey === 'QTY_DESC') setSortKey('QTY_ASC');
    else setSortKey('NAME_ASC');
  };
  
  const getSortLabel = () => {
      switch(sortKey) {
          case 'NAME_ASC': return "Nombre A-Z";
          case 'NAME_DESC': return "Nombre Z-A";
          case 'QTY_DESC': return "Mayor Cantidad";
          case 'QTY_ASC': return "Menor Cantidad";
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
            <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Equipos Globales</h2>
            <p className="text-sm text-zinc-500">Listado consolidado por tipo de equipo</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input 
                  placeholder="Buscar por nombre, marca o modelo..." 
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
               {searchTerm || filterLab ? "No se encontraron equipos con los filtros actuales." : "No hay equipos registrados en el sistema."}
           </div>
        ) : (
            processedList.map((item, idx) => (
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