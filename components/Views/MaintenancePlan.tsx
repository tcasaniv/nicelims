
import React, { useState, useMemo } from 'react';
import { Lab, MantenimientoTask } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { CalendarRange, Wrench, MapPin, AlertTriangle, List, LayoutGrid } from 'lucide-react';

interface MaintenancePlanProps {
    labs: Lab[];
}

type PlanType = 'preventivo' | 'correctivo';
type ViewMode = 'BY_FREQUENCY' | 'BY_LAB';

interface FlatTask {
    labName: string;
    labCode: string;
    equipmentName: string;
    brand: string;
    frequency: string;
    task: MantenimientoTask;
    uniqueKey: string;
}

export const MaintenancePlan: React.FC<MaintenancePlanProps> = ({ labs }) => {
    const [activeTab, setActiveTab] = useState<PlanType>('preventivo');
    const [viewMode, setViewMode] = useState<ViewMode>('BY_FREQUENCY');

    // Helper to extract and flatten all tasks based on type
    const allTasks = useMemo(() => {
        const tasks: FlatTask[] = [];

        labs.forEach((lab, labIdx) => {
            const labName = lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre";
            const labCode = lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C";

            (lab.equipos || []).forEach((eq, eqIdx) => {
                const eqName = eq["NOMBRE DEL EQUIPO"] || "Equipo";
                const brand = eq.infoEquipo?.Marca || "";

                const maintenanceData = eq.ProcedimientoMantenimiento?.mantenimiento?.[activeTab];

                if (maintenanceData) {
                    Object.entries(maintenanceData).forEach(([freq, taskList]) => {
                        if (taskList && Array.isArray(taskList)) {
                            taskList.forEach((t, tIdx) => {
                                tasks.push({
                                    labName,
                                    labCode,
                                    equipmentName: eqName,
                                    brand,
                                    frequency: freq,
                                    task: t,
                                    uniqueKey: `${labIdx}-${eqIdx}-${freq}-${tIdx}`
                                });
                            });
                        }
                    });
                }
            });
        });
        return tasks;
    }, [labs, activeTab]);

    // Grouping Logic
    const groupedTasks = useMemo(() => {
        const groups: Record<string, FlatTask[]> = {};

        allTasks.forEach(item => {
            let key = "";
            if (viewMode === 'BY_FREQUENCY') {
                // Format frequency key (e.g., "semanal" -> "Semanal")
                key = item.frequency.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
            } else {
                key = `${item.labCode} - ${item.labName}`;
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        return groups;
    }, [allTasks, viewMode]);

    // Sort groups keys to have a deterministic order
    const sortedGroupKeys = Object.keys(groupedTasks).sort();
    // If Frequency, custom sort logic could be applied here to have (Daily, Weekly, Monthly...) order

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                        <CalendarRange className="text-blue-600" /> Plan de Mantenimiento
                    </h2>
                    <p className="text-sm text-zinc-500">Gestión de actividades programadas y procedimientos.</p>
                </div>

                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={viewMode === 'BY_FREQUENCY' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}
                        onClick={() => setViewMode('BY_FREQUENCY')}
                    >
                        <List size={14} className="mr-2" /> Por Frecuencia
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={viewMode === 'BY_LAB' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}
                        onClick={() => setViewMode('BY_LAB')}
                    >
                        <LayoutGrid size={14} className="mr-2" /> Por Laboratorio
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preventivo' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                    onClick={() => setActiveTab('preventivo')}
                >
                    Mantenimiento Preventivo
                </button>
                <button
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'correctivo' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                    onClick={() => setActiveTab('correctivo')}
                >
                    Mantenimiento Correctivo
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6 animate-in fade-in duration-300">
                {sortedGroupKeys.length === 0 ? (
                    <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                        <Wrench className="mx-auto h-10 w-10 text-zinc-300 mb-2" />
                        <h3 className="text-lg font-medium text-zinc-500">No hay tareas configuradas</h3>
                        <p className="text-sm text-zinc-400">Edite los tipos de equipo para agregar procedimientos de mantenimiento.</p>
                    </div>
                ) : (
                    sortedGroupKeys.map(groupKey => (
                        <Card key={groupKey}>
                            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                                <CardTitle className="text-lg flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                                    {viewMode === 'BY_FREQUENCY' ? <List size={18} className="text-blue-500" /> : <MapPin size={18} className="text-emerald-500" />}
                                    {groupKey}
                                    <span className="ml-auto text-xs font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                                        {groupedTasks[groupKey].length} tareas
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {groupedTasks[groupKey].map((item) => (
                                        <div key={item.uniqueKey} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4">
                                            {/* Left: Equipment Info */}
                                            <div className="md:col-span-4">
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.equipmentName}</div>
                                                <div className="text-xs text-zinc-500">{item.brand}</div>
                                                {viewMode === 'BY_FREQUENCY' && (
                                                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                        <MapPin size={10} /> {item.labCode}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Middle: Task Details */}
                                            <div className="md:col-span-6 space-y-1">
                                                <div className="font-medium text-zinc-800 dark:text-zinc-200">{item.task.descripcion?.title || "Tarea sin título"}</div>
                                                {item.task.descripcion?.contenido && item.task.descripcion.contenido.length > 0 && (
                                                    <ul className="list-disc list-inside text-xs text-zinc-500 pl-1">
                                                        {item.task.descripcion.contenido.slice(0, 2).map((step, i) => (
                                                            <li key={i} className="truncate">{step}</li>
                                                        ))}
                                                        {item.task.descripcion.contenido.length > 2 && (
                                                            <li className="list-none text-[10px] text-zinc-400 pl-4 italic">+{item.task.descripcion.contenido.length - 2} pasos más...</li>
                                                        )}
                                                    </ul>
                                                )}
                                                {viewMode === 'BY_LAB' && (
                                                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                                                        {item.frequency}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Right: Meta (Cost/Resp) */}
                                            <div className="md:col-span-2 flex flex-col items-end justify-center text-right text-sm">
                                                {item.task["MONTO REF"]?.amount && item.task["MONTO REF"].amount !== "0" && (
                                                    <span className="font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded mb-1">
                                                        {item.task["MONTO REF"].currency} {item.task["MONTO REF"].amount}
                                                    </span>
                                                )}
                                                {item.task.responsable && (
                                                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                                                        Resp: {item.task.responsable}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
