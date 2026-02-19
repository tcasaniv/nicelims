import React, { useState, useMemo } from 'react';
import { Lab } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Cpu, MapPin, Box, ClipboardList, Calendar, Tag, ChevronUp, ChevronDown, ListFilter } from 'lucide-react';

interface GlobalEquipmentListProps {
    labs: Lab[];
}

// Grouped View Interface
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

export const GlobalEquipmentList: React.FC<GlobalEquipmentListProps> = ({ labs }) => {
    const [activeTab, setActiveTab] = useState<Tab>('TYPES');

    // --- STATE FOR TAB 1 (TYPES) ---
    const [typeFilters, setTypeFilters] = useState({
        name: "",
        qty: "",
        units: "",
        distribution: ""
    });
    const [typeSortConfig, setTypeSortConfig] = useState<{ key: keyof EquipmentGroup | 'distribution'; direction: 'asc' | 'desc' } | null>(null);

    // --- STATE FOR TAB 2 (UNITS) ---
    const [unitFilters, setUnitFilters] = useState({
        code: "",
        equipment: "",
        lab: "",
        location: "",
        date: ""
    });
    const [unitSortConfig, setUnitSortConfig] = useState<{ key: keyof FlatUnit | 'lab'; direction: 'asc' | 'desc' } | null>(null);

    // Helper to extract unique labs for filter dropdown (Used in Units tab)
    const availableLabs = useMemo(() => {
        const unique = new Map<string, string>();
        labs.forEach(l => {
            const code = l.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"];
            const name = l.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"];
            if (code && (l.equipos || []).length > 0) unique.set(code, name || "Sin Nombre");
        });
        return Array.from(unique.entries());
    }, [labs]);


    // --- LOGIC FOR GROUPED TYPES (TAB 1) ---
    const processedTypes = useMemo(() => {
        // 1. Group equipment by name
        const grouped = labs.reduce((acc, lab) => {
            const labCode = lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C";

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

        // 2. Filter Logic (Column Based)
        if (typeFilters.name) {
            const lower = typeFilters.name.toLowerCase();
            list = list.filter(i => i.name.toLowerCase().includes(lower));
        }
        if (typeFilters.qty) {
            list = list.filter(i => i.totalQuantity.toString().includes(typeFilters.qty));
        }
        if (typeFilters.units) {
            list = list.filter(i => i.totalUnits.toString().includes(typeFilters.units));
        }
        if (typeFilters.distribution) {
            const lower = typeFilters.distribution.toLowerCase();
            list = list.filter(i =>
                i.locations.some(loc =>
                    loc.labCode.toLowerCase().includes(lower) ||
                    loc.brand.toLowerCase().includes(lower) ||
                    loc.model.toLowerCase().includes(lower)
                )
            );
        }

        // 3. Sort Logic
        if (typeSortConfig) {
            list.sort((a, b) => {
                let valA: any = "";
                let valB: any = "";

                switch (typeSortConfig.key) {
                    case 'name': valA = a.name; valB = b.name; break;
                    case 'totalQuantity': valA = a.totalQuantity; valB = b.totalQuantity; break;
                    case 'totalUnits': valA = a.totalUnits; valB = b.totalUnits; break;
                    case 'distribution': valA = a.locations.length; valB = b.locations.length; break; // Sort by number of locations/variants
                }

                if (valA < valB) return typeSortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return typeSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            // Default Sort
            list.sort((a, b) => a.name.localeCompare(b.name));
        }

        return list;
    }, [labs, typeFilters, typeSortConfig]);


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
    const handleTypeSort = (key: keyof EquipmentGroup | 'distribution') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (typeSortConfig && typeSortConfig.key === key && typeSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setTypeSortConfig({ key, direction });
    };

    const renderTypeSortIcon = (key: string) => {
        if (typeSortConfig?.key !== key) return <ListFilter size={12} className="opacity-30" />;
        return typeSortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
    };

    const handleUnitSort = (key: keyof FlatUnit | 'lab') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (unitSortConfig && unitSortConfig.key === key && unitSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setUnitSortConfig({ key, direction });
    };

    const renderUnitSortIcon = (key: string) => {
        if (unitSortConfig?.key !== key) return <ListFilter size={12} className="opacity-30" />;
        return unitSortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
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
                    <Box size={16} /> Tipos Agrupados
                </button>
                <button
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'UNITS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    onClick={() => setActiveTab('UNITS')}
                >
                    <ClipboardList size={16} /> Inventario Individual
                </button>
            </div>

            {/* --- CONTENT FOR TAB: TYPES (TABLE) --- */}
            {activeTab === 'TYPES' && (
                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                                    {/* Headers Row */}
                                    <tr>
                                        <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleTypeSort('name')}>
                                            <div className="flex items-center gap-2">Nombre del Equipo {renderTypeSortIcon('name')}</div>
                                        </th>
                                        <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleTypeSort('totalQuantity')}>
                                            <div className="flex items-center gap-2">Cant. Total {renderTypeSortIcon('totalQuantity')}</div>
                                        </th>
                                        <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleTypeSort('totalUnits')}>
                                            <div className="flex items-center gap-2">Unidades Inv. {renderTypeSortIcon('totalUnits')}</div>
                                        </th>
                                        <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleTypeSort('distribution')}>
                                            <div className="flex items-center gap-2">Distribución / Variantes {renderTypeSortIcon('distribution')}</div>
                                        </th>
                                    </tr>
                                    {/* Filter Inputs Row */}
                                    <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                        <th className="px-4 py-2">
                                            <input
                                                className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Filtro nombre..."
                                                value={typeFilters.name}
                                                onChange={(e) => setTypeFilters(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </th>
                                        <th className="px-4 py-2">
                                            <input
                                                className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="#"
                                                value={typeFilters.qty}
                                                onChange={(e) => setTypeFilters(prev => ({ ...prev, qty: e.target.value }))}
                                            />
                                        </th>
                                        <th className="px-4 py-2">
                                            <input
                                                className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="#"
                                                value={typeFilters.units}
                                                onChange={(e) => setTypeFilters(prev => ({ ...prev, units: e.target.value }))}
                                            />
                                        </th>
                                        <th className="px-4 py-2">
                                            <input
                                                className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Filtro lab, marca, modelo..."
                                                value={typeFilters.distribution}
                                                onChange={(e) => setTypeFilters(prev => ({ ...prev, distribution: e.target.value }))}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                    {processedTypes.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-10 text-center text-zinc-500">No se encontraron equipos agrupados.</td></tr>
                                    ) : (
                                        processedTypes.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                                                            <Cpu size={16} />
                                                        </div>
                                                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded w-fit">
                                                        {item.totalQuantity}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-500">
                                                    {item.totalUnits}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.locations.map((loc, locIdx) => (
                                                            <div key={locIdx} className="bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-xs flex gap-1 items-center" title={`${loc.labName} | ${loc.brand} ${loc.model}`}>
                                                                <MapPin size={10} className="text-zinc-400" />
                                                                <span className="font-semibold text-blue-600 dark:text-blue-400">{loc.labCode}</span>
                                                                <span className="text-zinc-500">: {loc.brand} {loc.model} ({loc.quantity})</span>
                                                            </div>
                                                        ))}
                                                    </div>
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

            {/* --- CONTENT FOR TAB: UNITS (TABLE) --- */}
            {activeTab === 'UNITS' && (
                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                                    {/* Headers Row */}
                                    <tr>
                                        <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('inventoryCode')}>
                                            <div className="flex items-center gap-2">Código {renderUnitSortIcon('inventoryCode')}</div>
                                        </th>
                                        <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('equipmentName')}>
                                            <div className="flex items-center gap-2">Equipo {renderUnitSortIcon('equipmentName')}</div>
                                        </th>
                                        <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('lab')}>
                                            <div className="flex items-center gap-2">Laboratorio {renderUnitSortIcon('lab')}</div>
                                        </th>
                                        <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('locationInLab')}>
                                            <div className="flex items-center gap-2">Detalle Ubicación {renderUnitSortIcon('locationInLab')}</div>
                                        </th>
                                        <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleUnitSort('acquisitionDate')}>
                                            <div className="flex items-center gap-2">Adquisición {renderUnitSortIcon('acquisitionDate')}</div>
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
                                                        <Tag size={14} className="text-blue-500" />
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
                                                            <MapPin size={12} /> {unit.locationInLab}
                                                        </div>
                                                    ) : <span className="text-zinc-300 italic">-</span>}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-zinc-500">
                                                    {unit.acquisitionDate ? (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={12} /> {unit.acquisitionDate}
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