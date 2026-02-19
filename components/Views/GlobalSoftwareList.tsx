import React, { useState, useMemo } from 'react';
import { Lab } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Save, MapPin, ChevronUp, ChevronDown, ListFilter, Tag } from 'lucide-react';

interface GlobalSoftwareListProps {
    labs: Lab[];
    onNavigateToItem?: (labIndex: number, softwareIndex: number) => void;
}

interface SoftwareGroup {
    name: string;
    totalLicenses: number;
    locations: {
        labIndex: number;
        softwareIndex: number;
        labCode: string;
        labName: string;
        version: string;
        licenses: number;
        type: string;
    }[];
}

export const GlobalSoftwareList: React.FC<GlobalSoftwareListProps> = ({ labs, onNavigateToItem }) => {
    // State for Column Filters
    const [filters, setFilters] = useState({
        name: "",
        licenses: "",
        details: "" // Searches in version, type, and lab code
    });

    // State for Sorting
    const [sortConfig, setSortConfig] = useState<{ key: keyof SoftwareGroup | 'details'; direction: 'asc' | 'desc' } | null>(null);

    const processedList = useMemo(() => {
        // 1. Group Data
        const grouped = labs.reduce((acc, lab, labIdx) => {
            const labCode = lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C";

            (lab.software || []).forEach((sw, swIdx) => {
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
                    labIndex: labIdx,
                    softwareIndex: swIdx,
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

        // 2. Apply Column Filters
        if (filters.name) {
            const lower = filters.name.toLowerCase();
            list = list.filter(item => item.name.toLowerCase().includes(lower));
        }
        if (filters.licenses) {
            list = list.filter(item => item.totalLicenses.toString().includes(filters.licenses));
        }
        if (filters.details) {
            const lower = filters.details.toLowerCase();
            list = list.filter(item =>
                item.locations.some(loc =>
                    loc.version.toLowerCase().includes(lower) ||
                    loc.type.toLowerCase().includes(lower) ||
                    loc.labCode.toLowerCase().includes(lower)
                )
            );
        }

        // 3. Apply Sorting
        if (sortConfig) {
            list.sort((a, b) => {
                let valA: any = "";
                let valB: any = "";

                switch (sortConfig.key) {
                    case 'name': valA = a.name; valB = b.name; break;
                    case 'totalLicenses': valA = a.totalLicenses; valB = b.totalLicenses; break;
                    case 'details': valA = a.locations.length; valB = b.locations.length; break; // Sort by number of installations
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            // Default sort by name
            list.sort((a, b) => a.name.localeCompare(b.name));
        }

        return list;
    }, [labs, filters, sortConfig]);

    // Handlers
    const handleSort = (key: keyof SoftwareGroup | 'details') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key: string) => {
        if (sortConfig?.key !== key) return <ListFilter size={12} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-purple-500" /> : <ChevronDown size={14} className="text-purple-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Software Global</h2>
                    <p className="text-sm text-zinc-500">Consolidado de licencias y versiones.</p>
                </div>
            </div>

            <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                                {/* Headers Row */}
                                <tr>
                                    <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 w-1/3" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-2">Nombre del Software {renderSortIcon('name')}</div>
                                    </th>
                                    <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 w-32" onClick={() => handleSort('totalLicenses')}>
                                        <div className="flex items-center gap-2">Licencias {renderSortIcon('totalLicenses')}</div>
                                    </th>
                                    <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleSort('details')}>
                                        <div className="flex items-center gap-2">Instalaciones y Versiones {renderSortIcon('details')}</div>
                                    </th>
                                </tr>
                                {/* Filters Row */}
                                <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                    <th className="px-4 py-2">
                                        <input
                                            className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            placeholder="Filtro nombre..."
                                            value={filters.name}
                                            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </th>
                                    <th className="px-4 py-2">
                                        <input
                                            className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            placeholder="#"
                                            value={filters.licenses}
                                            onChange={(e) => setFilters(prev => ({ ...prev, licenses: e.target.value }))}
                                        />
                                    </th>
                                    <th className="px-4 py-2">
                                        <input
                                            className="w-full px-2 py-1 text-xs font-normal border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            placeholder="Filtro versión, tipo, lab..."
                                            value={filters.details}
                                            onChange={(e) => setFilters(prev => ({ ...prev, details: e.target.value }))}
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                {processedList.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-10 text-center text-zinc-500">No se encontraron programas con los filtros actuales.</td></tr>
                                ) : (
                                    processedList.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                                                        <Save size={16} />
                                                    </div>
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded w-fit">
                                                    {item.totalLicenses}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {item.locations.map((loc, locIdx) => (
                                                        <div
                                                            key={locIdx}
                                                            className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700 text-xs flex flex-col gap-1 min-w-[120px] cursor-pointer hover:border-purple-400 hover:text-purple-600 transition-colors group"
                                                            title="Click para ir a detalle"
                                                            onClick={() => onNavigateToItem && onNavigateToItem(loc.labIndex, loc.softwareIndex)}
                                                        >
                                                            <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                                                <MapPin size={10} />
                                                                <span className="group-hover:underline">{loc.labCode}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                                                                <span className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded text-[10px]">v{loc.version}</span>
                                                                <span>x{loc.licenses}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-zinc-400 text-[10px] truncate max-w-[150px]">
                                                                <Tag size={8} /> {loc.type}
                                                            </div>
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
        </div>
    );
};