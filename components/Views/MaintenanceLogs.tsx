
import React, { useState, useMemo } from 'react';
import { Lab } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { ClipboardCheck, Search, Image as ImageIcon, List, Calendar, MapPin, Tag, User } from 'lucide-react';
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
    labName: string;
    photos: string[];
}

type Tab = 'LIST' | 'GALLERY';

export const MaintenanceLogs: React.FC<MaintenanceLogsProps> = ({ labs }) => {
    const [activeTab, setActiveTab] = useState<Tab>('LIST');
    const [filters, setFilters] = useState({
        search: "",
        lab: "",
        dateStart: "",
        dateEnd: ""
    });
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Extract all logs flatly
    const allLogs = useMemo(() => {
        const logs: FlatLog[] = [];
        labs.forEach((lab, lIdx) => {
            const labName = lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre";
            (lab.equipos || []).forEach((eq, eIdx) => {
                (eq.HojasDeVidaEquipos || []).forEach((unit, uIdx) => {
                    (unit.mantenimientos || []).forEach((log, logIdx) => {
                        logs.push({
                            id: `${lIdx}-${eIdx}-${uIdx}-${logIdx}`,
                            date: log.Fecha || "1970-01-01",
                            activity: log["Actividad realizada"] || "",
                            responsible: log.Responsable || "-",
                            observations: log.Observaciones || "",
                            unitCode: unit.infoEquipo?.["Codigo Inventario Equipo"] || "S/C",
                            equipmentName: eq["NOMBRE DEL EQUIPO"] || "Equipo",
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

            return matchSearch && matchLab && matchDate;
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
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Buscar por actividad, código o equipo..."
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
                </CardContent>
            </Card>

            {/* Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'LIST' && (
                    <div className="space-y-4">
                        {filteredLogs.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">No se encontraron actividades con los filtros seleccionados.</div>
                        ) : (
                            filteredLogs.map((log) => (
                                <div key={log.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-blue-400 transition-colors shadow-sm">
                                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex flex-col items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                                                <span className="text-xs font-bold text-blue-800 dark:text-blue-200 leading-none">{new Date(log.date).toLocaleString('default', { year: 'numeric' })}</span>
                                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">{new Date(log.date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-lg font-bold text-blue-800 dark:text-blue-200 leading-none">{new Date(log.date).getDate() + 1}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{log.activity}</h4>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1">
                                                    <span className="flex items-center gap-1 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded"><Tag size={12} /> {log.unitCode}</span>
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {log.labName}</span>
                                                    <span className="flex items-center gap-1 text-zinc-400"><User size={12} /> {log.responsible}</span>
                                                </div>
                                                {log.observations && (
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 bg-zinc-50 dark:bg-zinc-900 p-2 rounded border border-zinc-100 dark:border-zinc-800">
                                                        {log.observations}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {log.photos.length > 0 && (
                                            <div className="flex gap-2 items-center md:flex-col md:items-end">
                                                <span className="text-xs text-zinc-400">{log.photos.length} fotos</span>
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {log.photos.slice(0, 3).map((pic, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={pic}
                                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover cursor-zoom-in"
                                                            onClick={() => setZoomedImage(pic)}
                                                            alt="Evidencia"
                                                        />
                                                    ))}
                                                    {log.photos.length > 3 && (
                                                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 ring-2 ring-white dark:ring-zinc-900">
                                                            +{log.photos.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
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
