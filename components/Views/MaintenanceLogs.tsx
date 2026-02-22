
import React, { useState, useMemo } from 'react';
import { Lab } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { ClipboardCheck, Search, Image as ImageIcon, List, Calendar, MapPin, Tag, User, Settings2, Check, X } from 'lucide-react';
import { ImageViewer } from '../ui/ImageViewer';

interface MaintenanceLogsProps {
    labs: Lab[];
}

interface FlatLog {
    id: string; // unique combo
    date: string;
    activity: string;
    responsible: string;
    observations: string;
    unitCode: string;
    equipmentName: string;
    brand: string;
    model: string;
    patrimonialDenomination: string;
    equipmentType: string;
    labName: string;
    photos: string[];
}

type Tab = 'LIST' | 'GALLERY';

const ALL_COLUMNS = [
    { id: 'date', label: 'Fecha' },
    { id: 'equipmentName', label: 'Equipo' },
    { id: 'brand', label: 'Marca' },
    { id: 'model', label: 'Modelo' },
    { id: 'unitCode', label: 'Código/Patrimonio' },
    { id: 'patrimonialDenomination', label: 'Denominación' },
    { id: 'equipmentType', label: 'Tipo' },
    { id: 'activity', label: 'Actividad' },
    { id: 'responsible', label: 'Responsable' },
    { id: 'observations', label: 'Observaciones' },
    { id: 'labName', label: 'Laboratorio' },
];

export const MaintenanceLogs: React.FC<MaintenanceLogsProps> = ({ labs }) => {
    const [activeTab, setActiveTab] = useState<Tab>('LIST');
    const [filters, setFilters] = useState({
        search: "",
        lab: "",
        dateStart: "",
        dateEnd: "",
        responsible: "",
        observations: "",
        equipmentName: "",
        brand: "",
        model: "",
        patrimonialDenomination: "",
        equipmentType: "",
        activity: ""
    });
    const [visibleColumns, setVisibleColumns] = useState<string[]>(['date', 'equipmentName', 'unitCode', 'activity', 'responsible', 'labName']);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    // Extract all logs flatly
    const allLogs = useMemo(() => {
        const logs: FlatLog[] = [];
        labs.forEach((lab, lIdx) => {
            const labName = lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre";
            (lab.equipos || []).forEach((eq, eIdx) => {
                const equipmentName = eq["NOMBRE DEL EQUIPO"] || "Equipo";
                const brand = eq.infoEquipo?.Marca || "-";
                const model = eq.infoEquipo?.Modelo || "-";
                const patrimonialDenomination = eq.infoEquipo?.["Denominacion Patrimonial"] || "-";
                const equipmentType = eq.infoEquipo?.["Tipo de equipo:"] || "-";

                (eq.HojasDeVidaEquipos || []).forEach((unit, uIdx) => {
                    (unit.mantenimientos || []).forEach((log, logIdx) => {
                        logs.push({
                            id: `${lIdx}-${eIdx}-${uIdx}-${logIdx}`,
                            date: log.Fecha || "1970-01-01",
                            activity: log["Actividad realizada"] || "",
                            responsible: log.Responsable || "-",
                            observations: log.Observaciones || "",
                            unitCode: unit.infoEquipo?.["Codigo Inventario Equipo"] || "S/C",
                            equipmentName,
                            brand,
                            model,
                            patrimonialDenomination,
                            equipmentType,
                            labName: lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "LAB",
                            photos: log.Fotografias || []
                        });
                    });
                });
            });
        });
        // Default Sort Descending
        return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [labs]);

    // Apply Filters
    const filteredLogs = useMemo(() => {
        return allLogs.filter(log => {
            const matchSearch =
                filters.search === "" ||
                log.activity.toLowerCase().includes(filters.search.toLowerCase()) ||
                log.unitCode.toLowerCase().includes(filters.search.toLowerCase()) ||
                log.equipmentName.toLowerCase().includes(filters.search.toLowerCase());

            const matchLab = filters.lab === "" || log.labName === filters.lab;

            let matchDate = true;
            if (filters.dateStart) matchDate = matchDate && log.date >= filters.dateStart;
            if (filters.dateEnd) matchDate = matchDate && log.date <= filters.dateEnd;

            const matchResponsible = filters.responsible === "" || log.responsible.toLowerCase().includes(filters.responsible.toLowerCase());
            const matchObservations = filters.observations === "" || log.observations.toLowerCase().includes(filters.observations.toLowerCase());
            const matchEquipmentName = filters.equipmentName === "" || log.equipmentName.toLowerCase().includes(filters.equipmentName.toLowerCase());
            const matchBrand = filters.brand === "" || log.brand.toLowerCase().includes(filters.brand.toLowerCase());
            const matchModel = filters.model === "" || log.model.toLowerCase().includes(filters.model.toLowerCase());
            const matchPatrimonialDenomination = filters.patrimonialDenomination === "" || log.patrimonialDenomination.toLowerCase().includes(filters.patrimonialDenomination.toLowerCase());
            const matchEquipmentType = filters.equipmentType === "" || log.equipmentType.toLowerCase().includes(filters.equipmentType.toLowerCase());
            const matchActivity = filters.activity === "" || log.activity.toLowerCase().includes(filters.activity.toLowerCase());

            return matchSearch && matchLab && matchDate && matchResponsible && matchObservations && matchEquipmentName && matchBrand && matchModel && matchPatrimonialDenomination && matchEquipmentType && matchActivity;
        });
    }, [allLogs, filters]);

    // Extract unique labs for filter dropdown
    const uniqueLabs = useMemo(() => {
        const s = new Set<string>();
        allLogs.forEach(l => s.add(l.labName));
        return Array.from(s).sort();
    }, [allLogs]);

    // Extract photos for Gallery View
    const galleryPhotos = useMemo(() => {
        const photos: { url: string, log: FlatLog }[] = [];
        filteredLogs.forEach(log => {
            log.photos.forEach(url => {
                photos.push({ url, log });
            });
        });
        return photos;
    }, [filteredLogs]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                        <ClipboardCheck className="text-emerald-600" /> Bitácora de Actividades
                    </h2>
                    <p className="text-sm text-zinc-500">Registro histórico de mantenimientos realizados.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'LIST' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                    onClick={() => setActiveTab('LIST')}
                >
                    <List size={16} /> Listado Cronológico
                </button>
                <button
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'GALLERY' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                    onClick={() => setActiveTab('GALLERY')}
                >
                    <ImageIcon size={16} /> Galería de Evidencias
                </button>
            </div>

            {/* Filters Bar */}
            <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Búsqueda rápida (actividad, código o equipo)..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div>
                            <select
                                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.lab}
                                onChange={(e) => setFilters(prev => ({ ...prev, lab: e.target.value }))}
                            >
                                <option value="">Todos los Laboratorios</option>
                                {uniqueLabs.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                className="w-1/2 px-2 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.dateStart}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateStart: e.target.value }))}
                                title="Desde"
                            />
                            <input
                                type="date"
                                className="w-1/2 px-2 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.dateEnd}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateEnd: e.target.value }))}
                                title="Hasta"
                            />
                        </div>
                    </div>

                    {activeTab === 'LIST' && (
                        <div className="flex justify-end">
                            <div className="relative">
                                <button
                                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <Settings2 size={14} /> Columnas Visibles
                                </button>

                                {showColumnSelector && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 p-2 animate-in fade-in zoom-in duration-150">
                                        <div className="flex justify-between items-center px-2 py-1 mb-1 border-b border-zinc-100 dark:border-zinc-700">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Seleccionar Columnas</span>
                                            <button onClick={() => setShowColumnSelector(false)}><X size={12} /></button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {ALL_COLUMNS.map(col => (
                                                <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleColumns.includes(col.id)}
                                                        onChange={() => {
                                                            setVisibleColumns(prev =>
                                                                prev.includes(col.id)
                                                                    ? prev.filter(c => c !== col.id)
                                                                    : [...prev, col.id]
                                                            );
                                                        }}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="text-xs text-zinc-700 dark:text-zinc-300">{col.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'LIST' && (
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                    <tr>
                                        {visibleColumns.includes('date') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[120px]">Fecha</th>}
                                        {visibleColumns.includes('equipmentName') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[150px]">Equipo</th>}
                                        {visibleColumns.includes('brand') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[100px]">Marca</th>}
                                        {visibleColumns.includes('model') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[100px]">Modelo</th>}
                                        {visibleColumns.includes('unitCode') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[120px]">Código</th>}
                                        {visibleColumns.includes('patrimonialDenomination') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[150px]">Denominación</th>}
                                        {visibleColumns.includes('equipmentType') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[120px]">Tipo</th>}
                                        {visibleColumns.includes('activity') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[200px]">Actividad</th>}
                                        {visibleColumns.includes('responsible') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[150px]">Responsable</th>}
                                        {visibleColumns.includes('observations') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[200px]">Observaciones</th>}
                                        {visibleColumns.includes('labName') && <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[100px]">Lab</th>}
                                        <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-center">Fotos</th>
                                    </tr>
                                    {/* Column Filters Row */}
                                    <tr className="bg-zinc-100/50 dark:bg-zinc-800/50">
                                        {visibleColumns.includes('date') && <td className="px-2 py-2"></td>}
                                        {visibleColumns.includes('equipmentName') && (
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
                                                    placeholder="Filtrar..."
                                                    value={filters.equipmentName}
                                                    onChange={e => setFilters(prev => ({ ...prev, equipmentName: e.target.value }))}
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.includes('brand') && (
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
                                                    placeholder="Filtrar..."
                                                    value={filters.brand}
                                                    onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.includes('model') && (
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
                                                    placeholder="Filtrar..."
                                                    value={filters.model}
                                                    onChange={e => setFilters(prev => ({ ...prev, model: e.target.value }))}
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.includes('unitCode') && <td className="px-2 py-2"></td>}
                                        {visibleColumns.includes('patrimonialDenomination') && (
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
                                                    placeholder="Filtrar..."
                                                    value={filters.patrimonialDenomination}
                                                    onChange={e => setFilters(prev => ({ ...prev, patrimonialDenomination: e.target.value }))}
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.includes('equipmentType') && (
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
                                                    placeholder="Filtrar..."
                                                    value={filters.equipmentType}
                                                    onChange={e => setFilters(prev => ({ ...prev, equipmentType: e.target.value }))}
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.includes('activity') && (
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
                                                    placeholder="Filtrar..."
                                                    value={filters.activity}
                                                    onChange={e => setFilters(prev => ({ ...prev, activity: e.target.value }))}
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.includes('responsible') && (
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
                                                    placeholder="Filtrar..."
                                                    value={filters.responsible}
                                                    onChange={e => setFilters(prev => ({ ...prev, responsible: e.target.value }))}
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.includes('observations') && (
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900"
                                                    placeholder="Filtrar..."
                                                    value={filters.observations}
                                                    onChange={e => setFilters(prev => ({ ...prev, observations: e.target.value }))}
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.includes('labName') && <td className="px-2 py-2"></td>}
                                        <td className="px-2 py-2"></td>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center text-zinc-500">
                                                No se encontraron actividades con los filtros seleccionados.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                {visibleColumns.includes('date') && (
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{log.date}</span>
                                                            <span className="text-[10px] text-zinc-400 uppercase">{new Date(log.date).toLocaleString('es-ES', { weekday: 'long', timeZone: 'UTC' })}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.includes('equipmentName') && <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{log.equipmentName}</td>}
                                                {visibleColumns.includes('brand') && <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{log.brand}</td>}
                                                {visibleColumns.includes('model') && <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{log.model}</td>}
                                                {visibleColumns.includes('unitCode') && (
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">{log.unitCode}</span>
                                                    </td>
                                                )}
                                                {visibleColumns.includes('patrimonialDenomination') && <td className="px-4 py-3 text-xs text-zinc-500">{log.patrimonialDenomination}</td>}
                                                {visibleColumns.includes('equipmentType') && <td className="px-4 py-3 text-xs text-zinc-500">{log.equipmentType}</td>}
                                                {visibleColumns.includes('activity') && <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{log.activity}</td>}
                                                {visibleColumns.includes('responsible') && (
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                                                            <User size={12} className="text-zinc-400" />
                                                            <span>{log.responsible}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.includes('observations') && (
                                                    <td className="px-4 py-3">
                                                        <p className="text-xs text-zinc-500 line-clamp-2" title={log.observations}>{log.observations || "-"}</p>
                                                    </td>
                                                )}
                                                {visibleColumns.includes('labName') && (
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1 text-zinc-500">
                                                            <MapPin size={12} className="text-zinc-400" />
                                                            <span>{log.labName}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-center">
                                                    {log.photos.length > 0 ? (
                                                        <div className="flex justify-center -space-x-2 overflow-hidden">
                                                            {log.photos.slice(0, 2).map((pic, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={pic}
                                                                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover cursor-zoom-in"
                                                                    onClick={() => setZoomedImage(pic)}
                                                                    alt="Evidencia"
                                                                />
                                                            ))}
                                                            {log.photos.length > 2 && (
                                                                <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-500 ring-2 ring-white dark:ring-zinc-900">
                                                                    +{log.photos.length - 2}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : <span className="text-zinc-300">-</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'GALLERY' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {galleryPhotos.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-zinc-500">No hay evidencias fotográficas registradas.</div>
                        ) : (
                            galleryPhotos.map((item, idx) => (
                                <div key={idx} className="group relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden cursor-zoom-in" onClick={() => setZoomedImage(item.url)}>
                                    <img src={item.url} alt="Evidencia" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                                        <p className="text-xs font-bold line-clamp-2">{item.log.activity}</p>
                                        <p className="text-[10px] text-zinc-300">{item.log.date}</p>
                                        <p className="text-[10px] text-zinc-400 font-mono">{item.log.unitCode}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <ImageViewer
                isOpen={!!zoomedImage}
                onClose={() => setZoomedImage(null)}
                src={zoomedImage || ""}
            />
        </div>
    );
};
