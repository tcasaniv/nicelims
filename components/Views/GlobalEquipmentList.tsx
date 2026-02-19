import React, { useState, useMemo } from 'react';
import { Lab } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Cpu, MapPin, Search, Filter, ArrowUpDown, X, Box, ClipboardList, Calendar, Tag, ChevronUp, ChevronDown } from 'lucide-react';

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

// Flat Unit View Interface
interface FlatUnit {
    uniqueId: string;
    inventoryCode: string;
    equipmentName: string;
    brand: string;
    model: string;
    labCode: string;
    labName: string;
    acquisitionDate: string;
    locationInLab: string;
}

type Tab = 'TYPES' | 'UNITS';
type TypeSortOption = 'NAME_ASC' | 'NAME_DESC' | 'QTY_ASC' | 'QTY_DESC';

export const GlobalEquipmentList: React.FC<GlobalEquipmentListProps> = ({ labs }) => {
  const [activeTab, setActiveTab] = useState<Tab>('TYPES');
  
  // --- STATE FOR TAB 1 (TYPES) ---
  const [typeSearch, setTypeSearch] = useState("");
  const [typeFilterLab, setTypeFilterLab] = useState("");
  const [typeSort, setTypeSort] = useState<TypeSortOption>('NAME_ASC');

  // --- STATE FOR TAB 2 (UNITS) ---
  // Column Filters
  const [unitFilters, setUnitFilters] = useState({
      code: "",
      equipment: "",
      lab: "",
      location: "",
      date: ""
  });
  // Column Sorting
  const [unitSortConfig, setUnitSortConfig] = useState<{ key: keyof FlatUnit | 'lab'; direction: 'asc' | 'desc' } | null>(null);

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


  // --- LOGIC FOR GROUPED TYPES (TAB 1) ---
  const processedTypes = useMemo(() => {
    // 1. Group equipment by name
    const grouped = labs.reduce((acc, lab) => {
        const labCode = lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C";
        
        if (typeFilterLab && labCode !== typeFilterLab) return acc;

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
    if (typeSearch.trim()) {
        const lower = typeSearch.toLowerCase();
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
        if (typeSort === 'NAME_ASC') return a.name.localeCompare(b.name);
        if (typeSort === 'NAME_DESC') return b.name.localeCompare(a.name);
        if (typeSort === 'QTY_ASC') return a.totalQuantity - b.totalQuantity;
        if (typeSort === 'QTY_DESC') return b.totalQuantity - a.totalQuantity;
        return 0;
    });

    return list;
  }, [labs, typeSearch, typeFilterLab, typeSort]);


  // --- LOGIC FOR INDIVIDUAL UNITS (TAB 2) ---
  const processedUnits = useMemo(() => {
      let flatList: FlatUnit[] = [];

      // 1. Flatten Data
      labs.forEach((lab, labIdx) => {
          const labCode = lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C";
          const labName = lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre";

          (lab.equipos || []).forEach((eq, eqIdx) => {
              (eq.HojasDeVidaEquipos || []).forEach((unit, unitIdx) => {
                  flatList.push({
                      uniqueId: `${labIdx}-${eqIdx}-${unitIdx}`,
                      inventoryCode: unit.infoEquipo?.["Codigo Inventario Equipo"] || "S/C",
                      equipmentName: eq["NOMBRE DEL EQUIPO"] || "Desconocido",
                      brand: eq.infoEquipo?.Marca || "",
                      model: eq.infoEquipo?.Modelo || "",
                      labCode,
                      labName,
                      acquisitionDate: unit.infoEquipo?.["FECHA DE ADQUISICIÓN"] || "",
                      locationInLab: unit.infoEquipo?.Ubicación || ""
                  });
              });
          });
      });

      // 2. Apply Column Filters
      if (unitFilters.code) {
          const lower = unitFilters.code.toLowerCase();
          flatList = flatList.filter(u => u.inventoryCode.toLowerCase().includes(lower));
      }
      if (unitFilters.equipment) {
          const lower = unitFilters.equipment.toLowerCase();
          flatList = flatList.filter(u => 
              u.equipmentName.toLowerCase().includes(lower) || 
              u.brand.toLowerCase().includes(lower) || 
              u.model.toLowerCase().includes(lower)
          );
      }
      if (unitFilters.lab) {
          // Exact match for dropdown code
          flatList = flatList.filter(u => u.labCode === unitFilters.lab);
      }
      if (unitFilters.location) {
          const lower = unitFilters.location.toLowerCase();
          flatList = flatList.filter(u => u.locationInLab.toLowerCase().includes(lower));
      }
      if (unitFilters.date) {
          const lower = unitFilters.date.toLowerCase();
          flatList = flatList.filter(u => u.acquisitionDate.toLowerCase().includes(lower));
      }

      // 3. Apply Column Sorting
      if (unitSortConfig) {
          flatList.sort((a, b) => {
              let valA = "";
              let valB = "";

              switch (unitSortConfig.key) {
                  case 'inventoryCode': valA = a.inventoryCode; valB = b.inventoryCode; break;
                  case 'equipmentName': valA = a.equipmentName; valB = b.equipmentName; break;
                  case 'lab': valA = a.labCode; valB = b.labCode; break;
                  case 'locationInLab': valA = a.locationInLab; valB = b.locationInLab; break;
                  case 'acquisitionDate': valA = a.acquisitionDate; valB = b.acquisitionDate; break;
                  default: break;
              }

              if (valA < valB) return unitSortConfig.direction === 'asc' ? -1 : 1;
              if (valA > valB) return unitSortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }

      return flatList;
  }, [labs, unitFilters, unitSortConfig]);


  // --- HANDLERS ---
  const toggleTypeSort = () => {
    if (typeSort === 'NAME_ASC') setTypeSort('NAME_DESC');
    else if (typeSort === 'NAME_DESC') setTypeSort('QTY_DESC');
    else if (typeSort === 'QTY_DESC') setTypeSort('QTY_ASC');
    else setTypeSort('NAME_ASC');
  };
  
  const getTypeSortLabel = () => {
      switch(typeSort) {
          case 'NAME_ASC': return "Nombre A-Z";
          case 'NAME_DESC': return "Nombre Z-A";
          case 'QTY_DESC': return "Mayor Cantidad";
          case 'QTY_ASC': return "Menor Cantidad";
      }
  };

  const clearTypeFilters = () => {
      setTypeSearch("");
      setTypeFilterLab("");
      setTypeSort('NAME_ASC');
  };

  const handleUnitSort = (key: keyof FlatUnit | 'lab') => {
      let direction: 'asc' | 'desc' = 'asc';
      if (unitSortConfig && unitSortConfig.key === key && unitSortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setUnitSortConfig({ key, direction });
  };

  const renderSortIcon = (key: string) => {
      if (unitSortConfig?.key !== key) return <ArrowUpDown size={12} className="opacity-30" />;
      return unitSortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-500"/> : <ChevronDown size={14} className="text-blue-500"/>;
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Equipos Globales</h2>
            <p className="text-sm text-zinc-500">Gestión consolidada de activos y unidades.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <button 
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'TYPES' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          onClick={() => setActiveTab('TYPES')}
        >
          <Box size={16}/> Tipos Agrupados
        </button>
        <button 
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'UNITS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          onClick={() => setActiveTab('UNITS')}
        >
          <ClipboardList size={16}/> Inventario Individual
        </button>
      </div>

      {/* --- CONTENT FOR TAB: TYPES (WITH GLOBAL TOOLBAR) --- */}
      {activeTab === 'TYPES' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {/* Toolbar specifically for TYPES */}
             <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input 
                        placeholder="Buscar por nombre, marca o modelo..."
                        value={typeSearch} 
                        onChange={(e) => setTypeSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative min-w-[200px]">
                            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                            <select 
                                className="w-full h-10 pl-9 pr-3 rounded-md border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 appearance-none"
                                value={typeFilterLab}
                                onChange={(e) => setTypeFilterLab(e.target.value)}
                            >
                                <option value="">Todos los Laboratorios</option>
                                {availableLabs.map(([code, name]) => (
                                    <option key={code} value={code}>{code} - {name}</option>
                                ))}
                            </select>
                    </div>
                    <Button 
                            variant="secondary" 
                            onClick={toggleTypeSort} 
                            className="gap-2 min-w-[160px]" 
                            title="Ordenar"
                    >
                        <ArrowUpDown size={16}/>
                        <span className="text-xs">{getTypeSortLabel()}</span>
                    </Button>
                    {(typeSearch || typeFilterLab || typeSort !== 'NAME_ASC') && (
                        <Button variant="ghost" onClick={clearTypeFilters} className="px-2 text-zinc-500" title="Limpiar filtros">
                            <X size={18}/>
                        </Button>
                    )}
                </div>
             </div>

            {processedTypes.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                {typeSearch || typeFilterLab ? "No se encontraron equipos con los filtros actuales." : "No hay equipos registrados en el sistema."}
            </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {processedTypes.map((item, idx) => (
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
                    ))}
                </div>
            )}
          </div>
      )}

      {/* --- CONTENT FOR TAB: UNITS (TABLE WITH INLINE FILTERS) --- */}
      {activeTab === 'UNITS' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CardContent className="p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                              {/* Headers Row */}
                              <tr>
                                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('inventoryCode')}>
                                      <div className="flex items-center gap-2">Código {renderSortIcon('inventoryCode')}</div>
                                  </th>
                                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('equipmentName')}>
                                      <div className="flex items-center gap-2">Equipo {renderSortIcon('equipmentName')}</div>
                                  </th>
                                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('lab')}>
                                      <div className="flex items-center gap-2">Laboratorio {renderSortIcon('lab')}</div>
                                  </th>
                                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('locationInLab')}>
                                      <div className="flex items-center gap-2">Detalle Ubicación {renderSortIcon('locationInLab')}</div>
                                  </th>
                                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('acquisitionDate')}>
                                      <div className="flex items-center gap-2">Adquisición {renderSortIcon('acquisitionDate')}</div>
                                  </th>
                              </tr>
                              {/* Filter Inputs Row */}
                              <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                  <th className="px-4 py-2">
                                      <input 
                                          className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          placeholder="Filtro código..."
                                          value={unitFilters.code}
                                          onChange={(e) => setUnitFilters(prev => ({ ...prev, code: e.target.value }))}
                                      />
                                  </th>
                                  <th className="px-4 py-2">
                                      <input 
                                          className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          placeholder="Filtro nombre/marca..."
                                          value={unitFilters.equipment}
                                          onChange={(e) => setUnitFilters(prev => ({ ...prev, equipment: e.target.value }))}
                                      />
                                  </th>
                                  <th className="px-4 py-2">
                                      <select 
                                          className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          value={unitFilters.lab}
                                          onChange={(e) => setUnitFilters(prev => ({ ...prev, lab: e.target.value }))}
                                      >
                                          <option value="">Todos</option>
                                          {availableLabs.map(([code, name]) => (
                                              <option key={code} value={code}>{code}</option>
                                          ))}
                                      </select>
                                  </th>
                                  <th className="px-4 py-2">
                                      <input 
                                          className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          placeholder="Filtro ubicación..."
                                          value={unitFilters.location}
                                          onChange={(e) => setUnitFilters(prev => ({ ...prev, location: e.target.value }))}
                                      />
                                  </th>
                                  <th className="px-4 py-2">
                                      <input 
                                          className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          placeholder="Filtro fecha..."
                                          value={unitFilters.date}
                                          onChange={(e) => setUnitFilters(prev => ({ ...prev, date: e.target.value }))}
                                      />
                                  </th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                              {processedUnits.length === 0 ? (
                                  <tr><td colSpan={5} className="px-6 py-10 text-center text-zinc-500">No se encontraron unidades individuales.</td></tr>
                              ) : (
                                  processedUnits.map((unit) => (
                                      <tr key={unit.uniqueId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                          <td className="px-6 py-3">
                                              <div className="flex items-center gap-2">
                                                  <Tag size={14} className="text-blue-500"/>
                                                  <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{unit.inventoryCode}</span>
                                              </div>
                                          </td>
                                          <td className="px-6 py-3">
                                              <div className="font-medium text-zinc-800 dark:text-zinc-200">{unit.equipmentName}</div>
                                              <div className="text-xs text-zinc-500">{unit.brand} - {unit.model}</div>
                                          </td>
                                          <td className="px-6 py-3">
                                              <div className="flex flex-col">
                                                  <span className="font-semibold text-xs text-zinc-500">{unit.labCode}</span>
                                                  <span className="truncate max-w-[200px]" title={unit.labName}>{unit.labName}</span>
                                              </div>
                                          </td>
                                          <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                                              {unit.locationInLab ? (
                                                  <div className="flex items-center gap-1">
                                                      <MapPin size={12}/> {unit.locationInLab}
                                                  </div>
                                              ) : <span className="text-zinc-300 italic">-</span>}
                                          </td>
                                          <td className="px-6 py-3 whitespace-nowrap text-zinc-500">
                                              {unit.acquisitionDate ? (
                                                  <div className="flex items-center gap-1">
                                                      <Calendar size={12}/> {unit.acquisitionDate}
                                                  </div>
                                              ) : "-"}
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </CardContent>
          </Card>
      )}
    </div>
  );
};