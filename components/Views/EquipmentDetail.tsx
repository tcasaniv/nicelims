import React, { useState, useMemo } from 'react';
import { Equipo, Caracteristica, ProcedimientoMantenimiento, MantenimientoFrecuencia, MantenimientoTask, HojaDeVidaEquipo, MantenimientoLog, Documento, Lab } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { ImageViewer } from '../ui/ImageViewer';
import { ArrowLeft, Plus, Trash2, Save, Wrench, ClipboardList, Box, History, FileText, Copy, Camera, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, X, ExternalLink, ChevronUp, ChevronDown, ListFilter, Share2, Check, FlaskConical, Settings2 } from 'lucide-react';

interface EquipmentDetailProps {
    equipment: Equipo;
    allLabs?: Lab[];
    currentLabIndex?: number;
    onUpdate: (eq: Equipo) => void;
    onCopyEquipmentData?: (sourceEquipment: Equipo, targets: { labIndex: number, equipmentIndex: number }[], options: { fichaTecnica: boolean, procedimientos: boolean }) => void;
    onBack: () => void;
}

type Tab = 'GENERAL' | 'PROCEDIMIENTOS' | 'HOJAS_VIDA';
type MaintenanceType = 'preventivo' | 'correctivo';

const FREQUENCIES = [
    'enCadaUso', 'semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual'
];

export const EquipmentDetail: React.FC<EquipmentDetailProps> = ({ equipment, allLabs, currentLabIndex, onUpdate, onCopyEquipmentData, onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
    const [formData, setFormData] = useState<Equipo>(equipment);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

    // --- Helpers for Deep Updates ---
    const handleInfoChange = (key: keyof Equipo['infoEquipo'], value: string) => {
        setFormData(prev => ({
            ...prev,
            infoEquipo: { ...prev.infoEquipo, [key]: value }
        } as Equipo));
    };

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(equipment);

    const saveChanges = () => {
        onUpdate(formData);
    };

    // --- Render Tabs ---
    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-zinc-50 dark:bg-zinc-950 py-4 z-10 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {formData["NOMBRE DEL EQUIPO"] || "Equipo Sin Nombre"}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {formData.infoEquipo?.Marca} - {formData.infoEquipo?.Modelo}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {allLabs && onCopyEquipmentData && (
                        <Button variant="secondary" onClick={() => setIsCopyModalOpen(true)} className="gap-2">
                            <Copy size={16} /> Copiar a otros...
                        </Button>
                    )}
                    <Button onClick={saveChanges} disabled={!hasChanges} className="gap-2">
                        <Save size={16} /> Guardar Equipo
                        {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-1" />}
                    </Button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                <TabButton active={activeTab === 'GENERAL'} onClick={() => setActiveTab('GENERAL')} icon={<Box size={16} />}>Ficha Técnica</TabButton>
                <TabButton active={activeTab === 'PROCEDIMIENTOS'} onClick={() => setActiveTab('PROCEDIMIENTOS')} icon={<Wrench size={16} />}>Procedimientos Mantenimiento</TabButton>
                <TabButton active={activeTab === 'HOJAS_VIDA'} onClick={() => setActiveTab('HOJAS_VIDA')} icon={<ClipboardList size={16} />}>Hojas de Vida (Inventario)</TabButton>
            </div>

            {/* Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'GENERAL' && (
                    <GeneralTab formData={formData} setFormData={setFormData} handleInfoChange={handleInfoChange} />
                )}
                {activeTab === 'PROCEDIMIENTOS' && (
                    <ProceduresTab formData={formData} setFormData={setFormData} />
                )}
                {activeTab === 'HOJAS_VIDA' && (
                    <LifeSheetsTab formData={formData} setFormData={setFormData} />
                )}
            </div>

            {/* Copy Data Modal */}
            {allLabs && onCopyEquipmentData && (
                <CopyDataModal
                    isOpen={isCopyModalOpen}
                    onClose={() => setIsCopyModalOpen(false)}
                    allLabs={allLabs}
                    currentLabIndex={currentLabIndex}
                    sourceEquipment={formData}
                    onConfirm={(targets, options) => {
                        onCopyEquipmentData(formData, targets, options);
                        setIsCopyModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

// --- COPY DATA MODAL ---
const CopyDataModal = ({
    isOpen,
    onClose,
    allLabs,
    currentLabIndex,
    sourceEquipment,
    onConfirm
}: {
    isOpen: boolean;
    onClose: () => void;
    allLabs: Lab[];
    currentLabIndex?: number;
    sourceEquipment: Equipo;
    onConfirm: (targets: { labIndex: number, equipmentIndex: number }[], options: { fichaTecnica: boolean, procedimientos: boolean }) => void;
}) => {
    const [selectedTargets, setSelectedTargets] = useState<{ labIndex: number, equipmentIndex: number }[]>([]);
    const [options, setOptions] = useState({ fichaTecnica: true, procedimientos: true });
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLabs = useMemo(() => {
        return allLabs.map((lab, lIdx) => ({
            ...lab,
            originalLabIndex: lIdx,
            equipos: (lab.equipos || []).map((eq, eIdx) => ({ ...eq, originalEqIndex: eIdx }))
                .filter(eq => {
                    // Don't show the source equipment itself
                    if (lIdx === currentLabIndex && eq["NOMBRE DEL EQUIPO"] === sourceEquipment["NOMBRE DEL EQUIPO"] && eq.infoEquipo?.Marca === sourceEquipment.infoEquipo?.Marca && eq.infoEquipo?.Modelo === sourceEquipment.infoEquipo?.Modelo) {
                        return false;
                    }
                    if (!searchTerm) return true;
                    const search = searchTerm.toLowerCase();
                    return (
                        (eq["NOMBRE DEL EQUIPO"] || "").toLowerCase().includes(search) ||
                        (eq.infoEquipo?.Marca || "").toLowerCase().includes(search) ||
                        (eq.infoEquipo?.Modelo || "").toLowerCase().includes(search) ||
                        (lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "").toLowerCase().includes(search)
                    );
                })
        })).filter(lab => lab.equipos.length > 0);
    }, [allLabs, searchTerm, sourceEquipment, currentLabIndex]);

    const toggleTarget = (labIndex: number, eqIndex: number) => {
        setSelectedTargets(prev => {
            const exists = prev.find(t => t.labIndex === labIndex && t.equipmentIndex === eqIndex);
            if (exists) {
                return prev.filter(t => !(t.labIndex === labIndex && t.equipmentIndex === eqIndex));
            }
            return [...prev, { labIndex, equipmentIndex: eqIndex }];
        });
    };

    const toggleAllInLab = (labIndex: number, equipments: any[]) => {
        const labTargets = equipments.map(eq => ({ labIndex, equipmentIndex: eq.originalEqIndex }));
        const allSelected = labTargets.every(lt => selectedTargets.find(st => st.labIndex === lt.labIndex && st.equipmentIndex === lt.equipmentIndex));

        if (allSelected) {
            setSelectedTargets(prev => prev.filter(st => st.labIndex !== labIndex));
        } else {
            setSelectedTargets(prev => {
                const otherTargets = prev.filter(st => st.labIndex !== labIndex);
                return [...otherTargets, ...labTargets];
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Copiar Información a otros Equipos"
            className="max-w-3xl"
            footer={
                <div className="flex justify-between items-center w-full">
                    <p className="text-sm text-zinc-500">{selectedTargets.length} equipos seleccionados</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button onClick={() => onConfirm(selectedTargets, options)} disabled={selectedTargets.length === 0}>
                            Copiar Información
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-3">¿Qué información desea copiar?</p>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={options.fichaTecnica} onChange={e => setOptions({ ...options, fichaTecnica: e.target.checked })} className="rounded text-blue-600" />
                            <span className="text-sm">Ficha Técnica (Info General)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={options.procedimientos} onChange={e => setOptions({ ...options, procedimientos: e.target.checked })} className="rounded text-blue-600" />
                            <span className="text-sm">Procedimientos de Mantenimiento</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <Input
                            placeholder="Buscar por nombre de equipo, marca, modelo o laboratorio..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filteredLabs.map((lab) => (
                            <div key={lab.originalLabIndex} className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <FlaskConical size={14} className="text-blue-500" />
                                        {lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"]}
                                    </h4>
                                    <Button variant="ghost" size="sm" onClick={() => toggleAllInLab(lab.originalLabIndex, lab.equipos)} className="text-xs h-7">
                                        {lab.equipos.every(eq => selectedTargets.find(st => st.labIndex === lab.originalLabIndex && st.equipmentIndex === eq.originalEqIndex)) ? 'Desmarcar Lab' : 'Marcar Lab'}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {lab.equipos.map((eq: any) => {
                                        const isSelected = selectedTargets.some(t => t.labIndex === lab.originalLabIndex && t.equipmentIndex === eq.originalEqIndex);
                                        return (
                                            <div
                                                key={eq.originalEqIndex}
                                                onClick={() => toggleTarget(lab.originalLabIndex, eq.originalEqIndex)}
                                                className={`p-2 rounded border cursor-pointer transition-all flex items-center gap-3 ${isSelected ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-300'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                                    {isSelected && <Check size={12} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{eq["NOMBRE DEL EQUIPO"]}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{eq.infoEquipo?.Marca} {eq.infoEquipo?.Modelo}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {filteredLabs.length === 0 && (
                            <div className="p-8 text-center text-zinc-500">
                                No se encontraron otros equipos para copiar la información.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// --- SUB-COMPONENTS ---

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }> = ({ active, onClick, children, icon }) => (
    <button
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${active ? 'border-b-2 border-blue-600 text-blue-600' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        onClick={onClick}
    >
        {icon} {children}
    </button>
);

// --- 1. GENERAL TAB ---
const GeneralTab = ({ formData, setFormData, handleInfoChange }: { formData: Equipo, setFormData: React.Dispatch<React.SetStateAction<Equipo>>, handleInfoChange: any }) => {
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [newPhotoUrl, setNewPhotoUrl] = useState("");
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const addCharacteristic = () => {
        const newChar: Caracteristica = { Caracteristica: "", Descripcion: "" };
        setFormData(prev => ({ ...prev, caracteristicas: [...(prev.caracteristicas || []), newChar] }));
    };

    const updateCharacteristic = (idx: number, key: keyof Caracteristica, value: string) => {
        const newChars = [...(formData.caracteristicas || [])];
        newChars[idx] = { ...newChars[idx], [key]: value };
        setFormData(prev => ({ ...prev, caracteristicas: newChars }));
    };

    const removeCharacteristic = (idx: number) => {
        setFormData(prev => ({ ...prev, caracteristicas: (prev.caracteristicas || []).filter((_, i) => i !== idx) }));
    };

    // Document Helpers
    const addDocument = () => {
        const newDoc: Documento = { titulo: "", url: "" };
        setFormData(prev => ({ ...prev, documentos: [...(prev.documentos || []), newDoc] }));
    };

    const updateDocument = (idx: number, key: keyof Documento, value: string) => {
        const newDocs = [...(formData.documentos || [])];
        newDocs[idx] = { ...newDocs[idx], [key]: value };
        setFormData(prev => ({ ...prev, documentos: newDocs }));
    };

    const removeDocument = (idx: number) => {
        setFormData(prev => ({ ...prev, documentos: (prev.documentos || []).filter((_, i) => i !== idx) }));
    };


    const handleAddPhoto = () => {
        if (newPhotoUrl.trim()) {
            setFormData(prev => ({ ...prev, Fotografias: [...(prev.Fotografias || []), newPhotoUrl.trim()] }));
            setNewPhotoUrl("");
            setIsPhotoModalOpen(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Información Básica</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input label="Nombre del Equipo" value={formData["NOMBRE DEL EQUIPO"]} onChange={e => setFormData({ ...formData, "NOMBRE DEL EQUIPO": e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Marca" value={formData.infoEquipo?.Marca} onChange={e => handleInfoChange("Marca", e.target.value)} />
                            <Input label="Modelo" value={formData.infoEquipo?.Modelo} onChange={e => handleInfoChange("Modelo", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Fabricante" value={formData.infoEquipo?.Fabricante} onChange={e => handleInfoChange("Fabricante", e.target.value)} />
                            <Input label="Denominación Patrimonial" value={formData.infoEquipo?.["Denominacion Patrimonial"]} onChange={e => handleInfoChange("Denominacion Patrimonial", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Tipo de Equipo" value={formData.infoEquipo?.["Tipo de equipo:"]} onChange={e => handleInfoChange("Tipo de equipo:", e.target.value)} />
                            <Input label="Nº Total de Equipos" value={formData["Nº DE EQUIPOS"]} onChange={e => setFormData({ ...formData, "Nº DE EQUIPOS": e.target.value })} />
                        </div>
                        <Input label="Dimensiones" value={formData.infoEquipo?.Dimensiones} onChange={e => handleInfoChange("Dimensiones", e.target.value)} />
                        <Input textarea label="Comentarios Generales" value={formData.COMENTARIOS} onChange={e => setFormData({ ...formData, COMENTARIOS: e.target.value })} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Características Técnicas</CardTitle>
                            <Button size="sm" variant="secondary" onClick={addCharacteristic}><Plus size={14} /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(formData.caracteristicas || []).map((char, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <Input placeholder="Característica (ej. Potencia)" value={char.Caracteristica} onChange={e => updateCharacteristic(idx, 'Caracteristica', e.target.value)} className="flex-1" />
                                <Input placeholder="Descripción (ej. 500W)" value={char.Descripcion} onChange={e => updateCharacteristic(idx, 'Descripcion', e.target.value)} className="flex-1" />
                                <Button variant="icon" action="danger" onClick={() => removeCharacteristic(idx)}><Trash2 size={16} /></Button>
                            </div>
                        ))}
                        {(formData.caracteristicas || []).length === 0 && <p className="text-zinc-500 text-sm italic">Sin características registradas.</p>}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Fotografías (URLs)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            {(formData.Fotografias || []).map((photo, idx) => (
                                <div key={idx} className="relative group aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-zoom-in" onClick={() => setZoomedImage(photo)}>
                                    {photo ? <img src={photo} alt="Equipo" className="w-full h-full object-cover transition-transform hover:scale-105" /> : <div className="flex items-center justify-center h-full text-zinc-400">Sin Imagen</div>}
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="icon"
                                            action="danger"
                                            size="icon-sm"
                                            className="bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newPhotos = [...(formData.Fotografias || [])];
                                                newPhotos.splice(idx, 1);
                                                setFormData({ ...formData, Fotografias: newPhotos });
                                            }}
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setIsPhotoModalOpen(true)}
                                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400"
                            >
                                <Plus size={24} />
                                <span className="text-xs mt-1">Añadir Foto</span>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Document Section */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2"><FileText size={18} /> Documentación Técnica</CardTitle>
                            <Button size="sm" variant="secondary" onClick={addDocument}><Plus size={14} /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(formData.documentos || []).map((doc, idx) => (
                            <div key={idx} className="flex gap-2 items-start bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                                <div className="flex-1 space-y-1">
                                    <Input
                                        placeholder="Título (ej. Manual de Usuario)"
                                        value={doc.titulo}
                                        onChange={e => updateDocument(idx, 'titulo', e.target.value)}
                                        className="text-sm font-medium"
                                    />
                                    <Input
                                        placeholder="URL (https://...)"
                                        value={doc.url}
                                        onChange={e => updateDocument(idx, 'url', e.target.value)}
                                        className="text-xs font-mono text-zinc-500"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 mt-1">
                                    {doc.url && (
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="icon" action="primary" title="Abrir enlace">
                                                <ExternalLink size={16} />
                                            </Button>
                                        </a>
                                    )}
                                    <Button variant="icon" action="danger" onClick={() => removeDocument(idx)} title="Eliminar">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {(formData.documentos || []).length === 0 && <p className="text-zinc-500 text-sm italic">No hay documentos registrados (Manuales, Datasheets, etc).</p>}
                    </CardContent>
                </Card>
            </div>

            <Modal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                title="Añadir Fotografía"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsPhotoModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddPhoto}>Añadir</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Ingrese la URL de la imagen que desea asociar a este equipo.</p>
                    <Input
                        label="URL de la Imagen"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="https://ejemplo.com/foto.jpg"
                        autoFocus
                    />
                </div>
            </Modal>

            <ImageViewer
                isOpen={!!zoomedImage}
                onClose={() => setZoomedImage(null)}
                src={zoomedImage || ""}
            />
        </div>
    );
};

// --- 2. PROCEDURES TAB ---
const ProceduresTab = ({ formData, setFormData }: { formData: Equipo, setFormData: React.Dispatch<React.SetStateAction<Equipo>> }) => {
    const [maintType, setMaintType] = useState<MaintenanceType>('preventivo');
    const [frequency, setFrequency] = useState<string>('semestral');

    const updateProcedureText = (key: keyof ProcedimientoMantenimiento, value: string) => {
        setFormData(prev => ({
            ...prev,
            ProcedimientoMantenimiento: { ...prev.ProcedimientoMantenimiento, [key]: value }
        } as Equipo));
    };

    const getTasks = () => {
        return formData.ProcedimientoMantenimiento?.mantenimiento?.[maintType]?.[frequency] || [];
    };

    const addTask = () => {
        const newTask: MantenimientoTask = {
            descripcion: { title: "Nueva Tarea", Prioridad: 1, contenido: [""] },
            "MONTO REF": { currency: "S/.", amount: "0" },
            responsable: ""
        };

        // Deep clone to update
        const newFormData = JSON.parse(JSON.stringify(formData));
        if (!newFormData.ProcedimientoMantenimiento) newFormData.ProcedimientoMantenimiento = {};
        if (!newFormData.ProcedimientoMantenimiento.mantenimiento) newFormData.ProcedimientoMantenimiento.mantenimiento = {};
        if (!newFormData.ProcedimientoMantenimiento.mantenimiento[maintType]) newFormData.ProcedimientoMantenimiento.mantenimiento[maintType] = {};
        if (!newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency]) newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency] = [];

        newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency].push(newTask);
        setFormData(newFormData);
    };

    const duplicateTask = (taskIdx: number) => {
        const newFormData = JSON.parse(JSON.stringify(formData));
        const task = newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency][taskIdx];
        const newTask = JSON.parse(JSON.stringify(task));
        if (newTask.descripcion) {
            newTask.descripcion.title = `${newTask.descripcion.title} (Copia)`;
        }

        newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency].splice(taskIdx + 1, 0, newTask);
        setFormData(newFormData);
    };

    const updateTask = (taskIdx: number, field: string, value: any) => {
        const newFormData = JSON.parse(JSON.stringify(formData));
        const task = newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency][taskIdx];

        if (field === 'title') {
            if (!task.descripcion) task.descripcion = { title: "", Prioridad: 1, contenido: [] };
            task.descripcion.title = value;
        }
        if (field === 'responsable') task.responsable = value;
        if (field === 'fechaInicio') task.fechaInicio = value;
        if (field === 'fechaFin') task.fechaFin = value;
        if (field === 'cost') {
            if (!task["MONTO REF"]) task["MONTO REF"] = { currency: "S/.", amount: "0" };
            task["MONTO REF"].amount = value;
        }

        setFormData(newFormData);
    };

    // New step handlers
    const updateTaskStep = (taskIdx: number, stepIdx: number, value: string) => {
        const newFormData = JSON.parse(JSON.stringify(formData));
        const task = newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency][taskIdx];
        if (!task.descripcion) task.descripcion = { title: "", Prioridad: 1, contenido: [] };
        if (!task.descripcion.contenido) task.descripcion.contenido = [];
        task.descripcion.contenido[stepIdx] = value;
        setFormData(newFormData);
    };

    const addTaskStep = (taskIdx: number) => {
        const newFormData = JSON.parse(JSON.stringify(formData));
        const task = newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency][taskIdx];
        if (!task.descripcion) task.descripcion = { title: "", Prioridad: 1, contenido: [] };
        if (!task.descripcion.contenido) task.descripcion.contenido = [];
        task.descripcion.contenido.push("");
        setFormData(newFormData);
    };

    const removeTaskStep = (taskIdx: number, stepIdx: number) => {
        const newFormData = JSON.parse(JSON.stringify(formData));
        const task = newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency][taskIdx];
        if (task.descripcion?.contenido) {
            task.descripcion.contenido.splice(stepIdx, 1);
        }
        setFormData(newFormData);
    };

    const removeTask = (taskIdx: number) => {
        const newFormData = JSON.parse(JSON.stringify(formData));
        newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency].splice(taskIdx, 1);
        setFormData(newFormData);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Información Técnica del Procedimiento</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Input textarea rows={4} label="Principio de Operación" value={formData.ProcedimientoMantenimiento?.["Principio de Operacion"]} onChange={e => updateProcedureText("Principio de Operacion", e.target.value)} />
                    <Input textarea rows={4} label="Instalaciones Requeridas" value={formData.ProcedimientoMantenimiento?.["Instalaciones Requeridas"]} onChange={e => updateProcedureText("Instalaciones Requeridas", e.target.value)} />
                    <Input textarea rows={4} label="Partes y Componentes" value={formData.ProcedimientoMantenimiento?.["Partes"]} onChange={e => updateProcedureText("Partes", e.target.value)} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <CardTitle>Plan de Mantenimiento</CardTitle>
                        <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md">
                            <button onClick={() => setMaintType('preventivo')} className={`px-3 py-1 text-sm rounded-sm transition-all ${maintType === 'preventivo' ? 'bg-white dark:bg-zinc-700 shadow text-blue-600 font-medium' : 'text-zinc-500'}`}>Preventivo</button>
                            <button onClick={() => setMaintType('correctivo')} className={`px-3 py-1 text-sm rounded-sm transition-all ${maintType === 'correctivo' ? 'bg-white dark:bg-zinc-700 shadow text-red-600 font-medium' : 'text-zinc-500'}`}>Correctivo</button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar frequencies */}
                        <div className="w-full md:w-48 flex flex-col gap-1">
                            {FREQUENCIES.map(freq => (
                                <button
                                    key={freq}
                                    onClick={() => setFrequency(freq)}
                                    className={`text-left px-3 py-2 text-sm rounded-md capitalize ${frequency === freq ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600'}`}
                                >
                                    {freq.replace(/([A-Z])/g, ' $1').trim()}
                                </button>
                            ))}
                        </div>

                        {/* Task List */}
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold capitalize text-zinc-800 dark:text-zinc-200">Tareas {maintType}s - {frequency}</h4>
                                <Button size="sm" onClick={addTask}><Plus size={14} className="mr-1" /> Agregar Tarea</Button>
                            </div>

                            {getTasks().length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500">
                                    No hay tareas registradas para esta frecuencia.
                                </div>
                            ) : (
                                getTasks().map((task, idx) => (
                                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-3 relative group">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input label="Título Tarea" value={task.descripcion?.title} onChange={e => updateTask(idx, 'title', e.target.value)} />
                                            <Input label="Responsable" value={task.responsable} onChange={e => updateTask(idx, 'responsable', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input type="date" label="Fecha Inicio Programada" value={task.fechaInicio || ""} onChange={e => updateTask(idx, 'fechaInicio', e.target.value)} />
                                            <Input type="date" label="Fecha Fin Programada" value={task.fechaFin || ""} onChange={e => updateTask(idx, 'fechaFin', e.target.value)} />
                                        </div>

                                        {/* Steps Section */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pasos / Procedimiento</label>
                                            {(task.descripcion?.contenido || []).length === 0 && (
                                                <div className="text-sm text-zinc-400 italic">No hay pasos definidos.</div>
                                            )}
                                            {(task.descripcion?.contenido || []).map((step, stepIdx) => (
                                                <div key={stepIdx} className="flex gap-2 items-start group/step">
                                                    <span className="text-xs text-zinc-400 mt-2.5 w-5 text-right shrink-0 font-mono">{stepIdx + 1}.</span>
                                                    <Input
                                                        textarea
                                                        rows={2}
                                                        value={step}
                                                        onChange={e => updateTaskStep(idx, stepIdx, e.target.value)}
                                                        className="flex-1 text-sm min-h-[2.5rem]"
                                                    />
                                                    <Button variant="icon" action="danger" onClick={() => removeTaskStep(idx, stepIdx)} title="Eliminar paso">
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addTaskStep(idx)}
                                                className="text-blue-600 dark:text-blue-400 text-xs pl-9 hover:bg-transparent"
                                            >
                                                <Plus size={12} className="mr-1" /> Añadir paso
                                            </Button>
                                        </div>

                                        <Input label="Costo Ref (S/.)" type="number" value={task["MONTO REF"]?.amount} onChange={e => updateTask(idx, 'cost', e.target.value)} className="w-32" />

                                        <div className="absolute top-1 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="icon" action="primary" onClick={() => duplicateTask(idx)} title="Duplicar Tarea"><Copy size={16} /></Button>
                                            <Button variant="icon" action="danger" onClick={() => removeTask(idx)} title="Eliminar Tarea"><Trash2 size={16} /></Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// --- 3. LIFE SHEETS (INVENTORY) TAB ---
const INVENTORY_COLUMNS = [
    { id: 'codigo', label: 'Código Inventario' },
    { id: 'patrimonial', label: 'Código Patrimonial' },
    { id: 'serie', label: 'N° de serie' },
    { id: 'ubicacion', label: 'Ubicación Física' },
    { id: 'fecha', label: 'Fecha Adquisición' },
    { id: 'anio', label: 'Año Fabricación' },
    { id: 'modo', label: 'Modo Adquisición' },
    { id: 'estadoCons', label: 'Estado de conservación' },
    { id: 'estadoUso', label: 'Estado de uso' },
    { id: 'mantenimientos', label: 'Mantenimientos' }
];

const LifeSheetsTab = ({ formData, setFormData }: { formData: Equipo, setFormData: React.Dispatch<React.SetStateAction<Equipo>> }) => {
    const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null);

    // Custom Confirmation Modal State
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => { } });

    // Table State
    const [filters, setFilters] = useState({
        code: "",
        location: "",
        date: "",
        maint: "",
        patrimonial: "",
        serie: "",
        anio: "",
        modo: "",
        estadoCons: "",
        estadoUso: ""
    });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [isEditingTable, setIsEditingTable] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(['codigo', 'ubicacion', 'fecha', 'mantenimientos']);
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    const getProcessedUnits = () => {
        let units = (formData.HojasDeVidaEquipos || []).map((u, i) => ({ ...u, originalIndex: i }));

        // Filters
        if (filters.code) {
            const lower = filters.code.toLowerCase();
            units = units.filter(u => u.infoEquipo?.["Codigo Inventario Equipo"]?.toLowerCase().includes(lower));
        }
        if (filters.location) {
            const lower = filters.location.toLowerCase();
            units = units.filter(u => u.infoEquipo?.Ubicación?.toLowerCase().includes(lower));
        }
        if (filters.date) {
            const lower = filters.date.toLowerCase();
            units = units.filter(u => u.infoEquipo?.["FECHA DE ADQUISICIÓN"]?.toLowerCase().includes(lower));
        }
        if (filters.maint) {
            units = units.filter(u => (u.mantenimientos || []).length.toString().includes(filters.maint));
        }

        // Sort
        if (sortConfig) {
            units.sort((a, b) => {
                let valA: any = "";
                let valB: any = "";

                if (sortConfig.key === 'code') {
                    valA = a.infoEquipo?.["Codigo Inventario Equipo"] || "";
                    valB = b.infoEquipo?.["Codigo Inventario Equipo"] || "";
                } else if (sortConfig.key === 'location') {
                    valA = a.infoEquipo?.Ubicación || "";
                    valB = b.infoEquipo?.Ubicación || "";
                } else if (sortConfig.key === 'date') {
                    valA = a.infoEquipo?.["FECHA DE ADQUISICIÓN"] || "";
                    valB = b.infoEquipo?.["FECHA DE ADQUISICIÓN"] || "";
                } else if (sortConfig.key === 'maint') {
                    valA = (a.mantenimientos || []).length;
                    valB = (b.mantenimientos || []).length;
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return units;
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key: string) => {
        if (sortConfig?.key !== key) return <ListFilter size={12} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
    };

    const addUnit = () => {
        const newUnit: HojaDeVidaEquipo = {
            infoEquipo: { "Codigo Inventario Equipo": "NEW-000", "FECHA DE ADQUISICIÓN": "", "MODO DE ADQUISICIÓN": "", "Ubicación": "" },
            mantenimientos: [],
            nota: "",
            ultimaActualizacion: { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() },
            HechoPor: "",
            RevisadoPor: ""
        };
        setFormData(prev => ({ ...prev, HojasDeVidaEquipos: [...(prev.HojasDeVidaEquipos || []), newUnit] }));
        setSelectedUnitIndex((formData.HojasDeVidaEquipos || []).length);
    };

    const duplicateUnit = (idx: number) => {
        const unit = (formData.HojasDeVidaEquipos || [])[idx];
        if (!unit) return;
        const newUnit = JSON.parse(JSON.stringify(unit));
        if (newUnit.infoEquipo) {
            newUnit.infoEquipo["Codigo Inventario Equipo"] = `${newUnit.infoEquipo["Codigo Inventario Equipo"]}-CP`;
        }

        const newUnits = [...(formData.HojasDeVidaEquipos || [])];
        newUnits.splice(idx + 1, 0, newUnit);
        setFormData(prev => ({ ...prev, HojasDeVidaEquipos: newUnits }));
    };

    const deleteUnit = (idx: number) => {
        setConfirmationState({
            isOpen: true,
            title: "Eliminar Unidad",
            message: "¿Estás seguro de eliminar esta unidad del inventario?",
            onConfirm: () => {
                setFormData(prev => ({ ...prev, HojasDeVidaEquipos: (prev.HojasDeVidaEquipos || []).filter((_, i) => i !== idx) }));
                setSelectedUnitIndex(null);
                setConfirmationState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const updateUnit = (idx: number, unit: HojaDeVidaEquipo) => {
        const newUnits = [...(formData.HojasDeVidaEquipos || [])];
        newUnits[idx] = unit;
        setFormData(prev => ({ ...prev, HojasDeVidaEquipos: newUnits }));
    };

    const handleTableEdit = (idx: number, field: string, value: string) => {
        const unit = (formData.HojasDeVidaEquipos || [])[idx];
        if (!unit) return;
        const newUnit = { ...unit, infoEquipo: { ...(unit.infoEquipo || {}), [field]: value } as any };
        updateUnit(idx, newUnit);
    };

    // Move Logic
    const moveUnit = (idx: number, direction: 'UP' | 'DOWN') => {
        const newUnits = [...(formData.HojasDeVidaEquipos || [])];
        if (direction === 'UP' && idx > 0) {
            [newUnits[idx], newUnits[idx - 1]] = [newUnits[idx - 1], newUnits[idx]];
        } else if (direction === 'DOWN' && idx < newUnits.length - 1) {
            [newUnits[idx], newUnits[idx + 1]] = [newUnits[idx + 1], newUnits[idx]];
        }
        setFormData(prev => ({ ...prev, HojasDeVidaEquipos: newUnits }));
    };

    if (selectedUnitIndex !== null && formData.HojasDeVidaEquipos?.[selectedUnitIndex]) {
        return (
            <UnitDetail
                unit={formData.HojasDeVidaEquipos[selectedUnitIndex]}
                allUnits={formData.HojasDeVidaEquipos}
                onUpdate={(u) => updateUnit(selectedUnitIndex, u)}
                onBulkUpdate={(units) => setFormData(prev => ({ ...prev, HojasDeVidaEquipos: units }))}
                onBack={() => setSelectedUnitIndex(null)}
            />
        );
    }

    const processedUnits = getProcessedUnits();
    const isReorderDisabled = !!filters.code || !!filters.location || !!filters.date || !!filters.maint || !!sortConfig;

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <CardTitle>Inventario de Unidades</CardTitle>
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <Button variant="secondary" onClick={() => setShowColumnSelector(!showColumnSelector)}>
                                <Settings2 size={16} className="mr-2" /> Columnas
                            </Button>
                            {showColumnSelector && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 p-2 animate-in fade-in zoom-in duration-150">
                                    <div className="flex justify-between items-center px-2 py-1 mb-1 border-b border-zinc-100 dark:border-zinc-700">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Seleccionar Columnas</span>
                                        <button onClick={() => setShowColumnSelector(false)}><X size={12} /></button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {INVENTORY_COLUMNS.map(col => (
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
                        <Button variant={isEditingTable ? "primary" : "secondary"} onClick={() => setIsEditingTable(!isEditingTable)}>
                            {isEditingTable ? "Desactivar Edición" : "Activar Edición"}
                        </Button>
                        <Button onClick={addUnit}><Plus size={16} className="mr-2" /> Nueva Unidad</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                            {/* Headers */}
                            <tr>
                                {visibleColumns.includes('codigo') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('code')}>
                                        <div className="flex items-center gap-2">Código Inventario {renderSortIcon('code')}</div>
                                    </th>
                                )}
                                {visibleColumns.includes('patrimonial') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('patrimonial')}>
                                        <div className="flex items-center gap-2">Código Patrimonial {renderSortIcon('patrimonial')}</div>
                                    </th>
                                )}
                                {visibleColumns.includes('serie') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('serie')}>
                                        <div className="flex items-center gap-2">N° Serie {renderSortIcon('serie')}</div>
                                    </th>
                                )}
                                {visibleColumns.includes('ubicacion') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('location')}>
                                        <div className="flex items-center gap-2">Ubicación {renderSortIcon('location')}</div>
                                    </th>
                                )}
                                {visibleColumns.includes('fecha') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-2">Adquisición {renderSortIcon('date')}</div>
                                    </th>
                                )}
                                {visibleColumns.includes('anio') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('anio')}>
                                        <div className="flex items-center gap-2">Año Fab. {renderSortIcon('anio')}</div>
                                    </th>
                                )}
                                {visibleColumns.includes('modo') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('modo')}>
                                        <div className="flex items-center gap-2">Modo Adq. {renderSortIcon('modo')}</div>
                                    </th>
                                )}
                                {visibleColumns.includes('estadoCons') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('estadoCons')}>
                                        <div className="flex items-center gap-2">Est. Conservación {renderSortIcon('estadoCons')}</div>
                                    </th>
                                )}
                                {visibleColumns.includes('estadoUso') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('estadoUso')}>
                                        <div className="flex items-center gap-2">Est. Uso {renderSortIcon('estadoUso')}</div>
                                    </th>
                                )}
                                {visibleColumns.includes('mantenimientos') && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('maint')}>
                                        <div className="flex items-center gap-2">Mantenimientos {renderSortIcon('maint')}</div>
                                    </th>
                                )}
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                            {/* Filters */}
                            <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                {visibleColumns.includes('codigo') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro..." value={filters.code} onChange={e => setFilters({ ...filters, code: e.target.value })} />
                                    </th>
                                )}
                                {visibleColumns.includes('patrimonial') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro..." value={filters.patrimonial} onChange={e => setFilters({ ...filters, patrimonial: e.target.value })} />
                                    </th>
                                )}
                                {visibleColumns.includes('serie') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro..." value={filters.serie} onChange={e => setFilters({ ...filters, serie: e.target.value })} />
                                    </th>
                                )}
                                {visibleColumns.includes('ubicacion') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro..." value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} />
                                    </th>
                                )}
                                {visibleColumns.includes('fecha') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro..." value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} />
                                    </th>
                                )}
                                {visibleColumns.includes('anio') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro..." value={filters.anio} onChange={e => setFilters({ ...filters, anio: e.target.value })} />
                                    </th>
                                )}
                                {visibleColumns.includes('modo') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro..." value={filters.modo} onChange={e => setFilters({ ...filters, modo: e.target.value })} />
                                    </th>
                                )}
                                {visibleColumns.includes('estadoCons') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro..." value={filters.estadoCons} onChange={e => setFilters({ ...filters, estadoCons: e.target.value })} />
                                    </th>
                                )}
                                {visibleColumns.includes('estadoUso') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro..." value={filters.estadoUso} onChange={e => setFilters({ ...filters, estadoUso: e.target.value })} />
                                    </th>
                                )}
                                {visibleColumns.includes('mantenimientos') && (
                                    <th className="px-4 py-2">
                                        <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="#" value={filters.maint} onChange={e => setFilters({ ...filters, maint: e.target.value })} />
                                    </th>
                                )}
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {processedUnits.length === 0 && (
                                <tr><td colSpan={visibleColumns.length + 1} className="px-6 py-8 text-center text-zinc-500">No se encontraron unidades.</td></tr>
                            )}
                            {processedUnits.map((item, idx) => (
                                <tr key={item.originalIndex} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer" onClick={() => !isEditingTable && setSelectedUnitIndex(item.originalIndex)}>
                                    {visibleColumns.includes('codigo') && (
                                        <td className="px-6 py-3 font-medium font-mono">
                                            {isEditingTable ? (
                                                <Input
                                                    value={item.infoEquipo?.["Codigo Inventario Equipo"] || ""}
                                                    onChange={e => handleTableEdit(item.originalIndex, "Codigo Inventario Equipo", e.target.value)}
                                                    className="h-8 text-xs font-mono"
                                                />
                                            ) : (
                                                item.infoEquipo?.["Codigo Inventario Equipo"] || "Sin Código"
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.includes('patrimonial') && (
                                        <td className="px-6 py-3 font-medium font-mono text-xs">
                                            {isEditingTable ? (
                                                <Input
                                                    value={item.infoEquipo?.["Denominacion Patrimonial"] || ""}
                                                    onChange={e => handleTableEdit(item.originalIndex, "Denominacion Patrimonial", e.target.value)}
                                                    className="h-8 text-xs font-mono"
                                                />
                                            ) : (
                                                item.infoEquipo?.["Denominacion Patrimonial"] || "-"
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.includes('serie') && (
                                        <td className="px-6 py-3 text-xs">
                                            {isEditingTable ? (
                                                <Input
                                                    value={item.infoEquipo?.["N° de serie"] || ""}
                                                    onChange={e => handleTableEdit(item.originalIndex, "N° de serie", e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            ) : (
                                                item.infoEquipo?.["N° de serie"] || "-"
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.includes('ubicacion') && (
                                        <td className="px-6 py-3">
                                            {isEditingTable ? (
                                                <Input
                                                    value={item.infoEquipo?.Ubicación || ""}
                                                    onChange={e => handleTableEdit(item.originalIndex, "Ubicación", e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            ) : (
                                                item.infoEquipo?.Ubicación || "-"
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.includes('fecha') && (
                                        <td className="px-6 py-3">
                                            {isEditingTable ? (
                                                <Input
                                                    type="date"
                                                    value={item.infoEquipo?.["FECHA DE ADQUISICIÓN"] || ""}
                                                    onChange={e => handleTableEdit(item.originalIndex, "FECHA DE ADQUISICIÓN", e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            ) : (
                                                item.infoEquipo?.["FECHA DE ADQUISICIÓN"] || "-"
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.includes('anio') && (
                                        <td className="px-6 py-3 text-xs">
                                            {isEditingTable ? (
                                                <Input
                                                    value={item.infoEquipo?.["Año Fabricación"] || ""}
                                                    onChange={e => handleTableEdit(item.originalIndex, "Año Fabricación", e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            ) : (
                                                item.infoEquipo?.["Año Fabricación"] || "-"
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.includes('modo') && (
                                        <td className="px-6 py-3 text-xs">
                                            {isEditingTable ? (
                                                <Input
                                                    value={item.infoEquipo?.["MODO DE ADQUISICIÓN"] || ""}
                                                    onChange={e => handleTableEdit(item.originalIndex, "MODO DE ADQUISICIÓN", e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            ) : (
                                                item.infoEquipo?.["MODO DE ADQUISICIÓN"] || "-"
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.includes('estadoCons') && (
                                        <td className="px-6 py-3 text-xs">
                                            {isEditingTable ? (
                                                <select
                                                    className="w-full h-8 px-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={item.infoEquipo?.["Estado de conservación"] || ""}
                                                    onChange={e => handleTableEdit(item.originalIndex, "Estado de conservación", e.target.value)}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="Nuevo">Nuevo (N)</option>
                                                    <option value="Bueno">Bueno (B)</option>
                                                    <option value="Regular">Regular (R)</option>
                                                    <option value="Malo">Malo (M)</option>
                                                    <option value="RAEE">RAEE (X)</option>
                                                    <option value="Chatarra">Chatarra (Y)</option>
                                                </select>
                                            ) : (
                                                item.infoEquipo?.["Estado de conservación"] || "-"
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.includes('estadoUso') && (
                                        <td className="px-6 py-3 text-xs">
                                            {isEditingTable ? (
                                                <Input
                                                    value={item.infoEquipo?.["Estado de uso"] || ""}
                                                    onChange={e => handleTableEdit(item.originalIndex, "Estado de uso", e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            ) : (
                                                item.infoEquipo?.["Estado de uso"] || "-"
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.includes('mantenimientos') && (
                                        <td className="px-6 py-3" onClick={() => isEditingTable && setSelectedUnitIndex(item.originalIndex)}><span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-100 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">{(item.mantenimientos || []).length} regs</span></td>
                                    )}
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end items-center gap-1">
                                            {!isReorderDisabled && (
                                                <div className="flex gap-1 mr-2 bg-zinc-100 dark:bg-zinc-800 rounded">
                                                    <Button variant="icon" action="primary" size="icon-md" onClick={(e) => { e.stopPropagation(); moveUnit(item.originalIndex, 'UP'); }} disabled={idx === 0}>
                                                        <ArrowUp size={14} />
                                                    </Button>
                                                    <Button variant="icon" action="primary" size="icon-md" onClick={(e) => { e.stopPropagation(); moveUnit(item.originalIndex, 'DOWN'); }} disabled={idx === processedUnits.length - 1}>
                                                        <ArrowDown size={14} />
                                                    </Button>
                                                </div>
                                            )}
                                            {isEditingTable && (
                                                <Button variant="icon" action="primary" size="icon-md" onClick={(e) => { e.stopPropagation(); setSelectedUnitIndex(item.originalIndex); }} title="Editar Detalles">
                                                    <Wrench size={16} />
                                                </Button>
                                            )}
                                            <Button variant="icon" action="primary" size="icon-md" onClick={(e) => { e.stopPropagation(); duplicateUnit(item.originalIndex); }} title="Duplicar">
                                                <Copy size={16} />
                                            </Button>
                                            <Button variant="icon" action="danger" size="icon-md" onClick={(e) => { e.stopPropagation(); deleteUnit(item.originalIndex); }} title="Eliminar">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {isReorderDisabled && processedUnits.length > 0 && (
                    <p className="text-xs text-zinc-400 mt-2 px-6 pb-2 text-right">* El reordenamiento está desactivado mientras los filtros u ordenamiento estén activos.</p>
                )}
            </CardContent>

            {/* General Confirmation Modal for Units */}
            <Modal
                isOpen={confirmationState.isOpen}
                onClose={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
                title={confirmationState.title}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}>Cancelar</Button>
                        <Button variant="danger" onClick={confirmationState.onConfirm}>Confirmar Eliminación</Button>
                    </>
                }
            >
                <p className="text-zinc-700 dark:text-zinc-300">{confirmationState.message}</p>
            </Modal>
        </Card>
    );
};

// --- UNIT DETAIL (Nested in Life Sheets) ---
const UnitDetail = ({ unit, allUnits, onUpdate, onBulkUpdate, onBack }: { 
    unit: HojaDeVidaEquipo, 
    allUnits: HojaDeVidaEquipo[], 
    onUpdate: (u: HojaDeVidaEquipo) => void, 
    onBulkUpdate: (units: HojaDeVidaEquipo[]) => void,
    onBack: () => void 
}) => {
    const [maintenancePhotoModal, setMaintenancePhotoModal] = useState<{ logIdx: number; isOpen: boolean } | null>(null);
    const [newMaintPhotoUrl, setNewMaintPhotoUrl] = useState("");
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [copyModal, setCopyModal] = useState<{ logIdx: number; targetUnitIndices: number[] } | null>(null);

    // Custom Confirmation Modal State
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => { } });

    const handleInfoChange = (key: string, value: string) => {
        onUpdate({ ...unit, infoEquipo: { ...(unit.infoEquipo || {}), [key]: value } as any });
    };

    const addDocument = () => {
        const newDoc: Documento = { titulo: "", url: "" };
        onUpdate({ ...unit, documentos: [...(unit.documentos || []), newDoc] });
    };

    const updateDocument = (idx: number, key: keyof Documento, value: string) => {
        const newDocs = [...(unit.documentos || [])];
        newDocs[idx] = { ...newDocs[idx], [key]: value };
        onUpdate({ ...unit, documentos: newDocs });
    };

    const removeDocument = (idx: number) => {
        onUpdate({ ...unit, documentos: (unit.documentos || []).filter((_, i) => i !== idx) });
    };

    // --- Helper to sort logs Chronologically (Oldest to Newest) ---
    const sortAndSaveLogs = (logs: MantenimientoLog[]) => {
        const sorted = [...logs].sort((a, b) => {
            const dateA = new Date(a.Fecha || '1970-01-01').getTime();
            const dateB = new Date(b.Fecha || '1970-01-01').getTime();
            return dateA - dateB;
        });
        onUpdate({ ...unit, mantenimientos: sorted });
    };

    const addMaintenance = () => {
        const newLog: MantenimientoLog = {
            Nro: (unit.mantenimientos || []).length + 1,
            "Actividad realizada": "",
            Fecha: new Date().toISOString().split('T')[0],
            Responsable: "",
            Observaciones: "",
            Fotografias: []
        };
        // Add to array then Sort and Save
        const newLogs = [...(unit.mantenimientos || []), newLog];
        sortAndSaveLogs(newLogs);
    };

    const duplicateMaintenance = (idx: number) => {
        const log = (unit.mantenimientos || [])[idx];
        if (!log) return;
        const newLog = JSON.parse(JSON.stringify(log));
        newLog.Nro = (unit.mantenimientos || []).length + 1;

        const newLogs = [...(unit.mantenimientos || []), newLog];
        sortAndSaveLogs(newLogs);
    };

    const deleteMaintenance = (idx: number) => {
        setConfirmationState({
            isOpen: true,
            title: "Eliminar Mantenimiento",
            message: "¿Estás seguro de eliminar este registro de mantenimiento?",
            onConfirm: () => {
                const newLogs = (unit.mantenimientos || []).filter((_, i) => i !== idx);
                onUpdate({ ...unit, mantenimientos: newLogs });
                setConfirmationState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const updateMaintenance = (idx: number, log: MantenimientoLog) => {
        const newLogs = [...(unit.mantenimientos || [])];
        newLogs[idx] = log;
        sortAndSaveLogs(newLogs);
    };

    const openPhotoModal = (idx: number) => {
        setMaintenancePhotoModal({ logIdx: idx, isOpen: true });
        setNewMaintPhotoUrl("");
    };

    const addPhotoToLog = () => {
        if (maintenancePhotoModal && newMaintPhotoUrl.trim()) {
            const idx = maintenancePhotoModal.logIdx;
            const log = (unit.mantenimientos || [])[idx];
            const updatedLog = { ...log, Fotografias: [...(log.Fotografias || []), newMaintPhotoUrl.trim()] };
            updateMaintenance(idx, updatedLog);
            setNewMaintPhotoUrl("");
        }
    };

    const removePhotoFromLog = (logIdx: number, photoIdx: number) => {
        const log = (unit.mantenimientos || [])[logIdx];
        const updatedLog = { ...log, Fotografias: (log.Fotografias || []).filter((_, i) => i !== photoIdx) };
        updateMaintenance(logIdx, updatedLog);
    };

    const addDocumentToLog = (logIdx: number) => {
        const log = (unit.mantenimientos || [])[logIdx];
        const newDoc: Documento = { titulo: "", url: "" };
        const updatedLog = { ...log, documentos: [...(log.documentos || []), newDoc] };
        updateMaintenance(logIdx, updatedLog);
    };

    const updateDocumentInLog = (logIdx: number, docIdx: number, key: keyof Documento, value: string) => {
        const log = (unit.mantenimientos || [])[logIdx];
        const newDocs = [...(log.documentos || [])];
        newDocs[docIdx] = { ...newDocs[docIdx], [key]: value };
        const updatedLog = { ...log, documentos: newDocs };
        updateMaintenance(logIdx, updatedLog);
    };

    const removeDocumentFromLog = (logIdx: number, docIdx: number) => {
        const log = (unit.mantenimientos || [])[logIdx];
        const updatedLog = { ...log, documentos: (log.documentos || []).filter((_, i) => i !== docIdx) };
        updateMaintenance(logIdx, updatedLog);
    };

    const copyMaintenanceToUnits = () => {
        if (!copyModal) return;
        const sourceLog = (unit.mantenimientos || [])[copyModal.logIdx];
        const newUnits = [...allUnits];

        copyModal.targetUnitIndices.forEach(targetIdx => {
            const targetUnit = { ...newUnits[targetIdx] };
            const targetLogs = [...(targetUnit.mantenimientos || [])];

            // Check for duplicates (same activity and date)
            const isDuplicate = targetLogs.some(log => 
                log["Actividad realizada"] === sourceLog["Actividad realizada"] && 
                log.Fecha === sourceLog.Fecha
            );

            if (!isDuplicate && sourceLog) {
                const newLog = JSON.parse(JSON.stringify(sourceLog));
                newLog.Nro = targetLogs.length + 1;
                targetLogs.push(newLog);
                
                // Sort target logs
                targetLogs.sort((a, b) => {
                    const dateA = new Date(a.Fecha || '1970-01-01').getTime();
                    const dateB = new Date(b.Fecha || '1970-01-01').getTime();
                    return dateA - dateB;
                });

                targetUnit.mantenimientos = targetLogs;
                newUnits[targetIdx] = targetUnit;
            }
        });

        onBulkUpdate(newUnits);
        setCopyModal(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" onClick={onBack} size="sm"><ArrowLeft size={16} /> Volver al Inventario</Button>
                <h3 className="font-bold text-lg">{unit.infoEquipo?.["Codigo Inventario Equipo"]}</h3>
            </div>

            <Card>
                <CardHeader><CardTitle>Datos de la Unidad</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Código Inventario" value={unit.infoEquipo?.["Codigo Inventario Equipo"]} onChange={e => handleInfoChange("Codigo Inventario Equipo", e.target.value)} />
                        <Input label="Código Patrimonial" value={unit.infoEquipo?.["Codigo Patrimonial"]} onChange={e => handleInfoChange("Codigo Patrimonial", e.target.value)} />
                        <Input label="N° de serie" value={unit.infoEquipo?.["N° de serie"]} onChange={e => handleInfoChange("N° de serie", e.target.value)} />
                        <Input label="Ubicación Física" value={unit.infoEquipo?.Ubicación} onChange={e => handleInfoChange("Ubicación", e.target.value)} />
                        <Input label="Fecha Adquisición" type="date" value={unit.infoEquipo?.["FECHA DE ADQUISICIÓN"]} onChange={e => handleInfoChange("FECHA DE ADQUISICIÓN", e.target.value)} />
                        <Input label="Año Fabricación" value={unit.infoEquipo?.["Año Fabricación"]} onChange={e => handleInfoChange("Año Fabricación", e.target.value)} />
                        <Input label="Modo Adquisición" value={unit.infoEquipo?.["MODO DE ADQUISICIÓN"]} onChange={e => handleInfoChange("MODO DE ADQUISICIÓN", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Estado de conservación</label>
                            <select
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                value={unit.infoEquipo?.["Estado de conservación"] || ""}
                                onChange={e => handleInfoChange("Estado de conservación", e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Nuevo">Nuevo (N)</option>
                                <option value="Bueno">Bueno (B)</option>
                                <option value="Regular">Regular (R)</option>
                                <option value="Malo">Malo (M)</option>
                                <option value="RAEE">RAEE (X)</option>
                                <option value="Chatarra">Chatarra (Y)</option>
                            </select>
                        </div>
                        <Input label="Estado de uso" value={unit.infoEquipo?.["Estado de uso"]} onChange={e => handleInfoChange("Estado de uso", e.target.value)} placeholder="Ej. En uso, en desuso, repuesto..." />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2"><FileText size={18} /> Documentación de la Unidad</CardTitle>
                        <Button size="sm" variant="secondary" onClick={addDocument}><Plus size={14} /></Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {(unit.documentos || []).map((doc, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                            <div className="flex-1 space-y-1">
                                <Input
                                    placeholder="Nombre del recurso (ej. Guía de remisión)"
                                    value={doc.titulo}
                                    onChange={e => updateDocument(idx, 'titulo', e.target.value)}
                                    className="text-sm font-medium"
                                />
                                <Input
                                    placeholder="URL (https://...)"
                                    value={doc.url}
                                    onChange={e => updateDocument(idx, 'url', e.target.value)}
                                    className="text-xs font-mono text-zinc-500"
                                />
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                                {doc.url && (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="icon" action="primary" title="Abrir enlace">
                                            <ExternalLink size={16} />
                                        </Button>
                                    </a>
                                )}
                                <Button variant="icon" action="danger" onClick={() => removeDocument(idx)} title="Eliminar">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {(unit.documentos || []).length === 0 && <p className="text-zinc-500 text-sm italic">No hay documentos registrados para esta unidad.</p>}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><History size={18} /> Bitácora de Mantenimiento</h3>
                    <Button size="sm" onClick={addMaintenance}><Plus size={14} className="mr-1" /> Registrar Actividad</Button>
                </div>

                {(unit.mantenimientos || []).map((log, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-4 space-y-3 relative group">
                            <div className="relative top-2 right-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="icon" action="primary" size="sm" onClick={() => setCopyModal({ logIdx: idx, targetUnitIndices: [] })} title="Copiar a otras unidades"><Share2 size={14} /></Button>
                                <Button variant="icon" action="primary" size="sm" onClick={() => duplicateMaintenance(idx)} title="Duplicar entrada"><Copy size={14} /></Button>
                                <Button variant="icon" action="danger" size="sm" onClick={() => deleteMaintenance(idx)} title="Eliminar entrada"><Trash2 size={14} /></Button>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-xs text-zinc-400">Reg #{log.Nro}</span>
                                <div className="flex gap-2">
                                    <Input type="date" label="Fecha Inicio" value={log.Fecha || ""} onChange={e => updateMaintenance(idx, { ...log, Fecha: e.target.value })} className="w-auto text-xs py-1" />
                                    <Input type="date" label="Fecha Fin" value={log.fechaFin || ""} onChange={e => updateMaintenance(idx, { ...log, fechaFin: e.target.value })} className="w-auto text-xs py-1" />
                                </div>
                            </div>
                            <Input label="Actividad Realizada" value={log["Actividad realizada"]} onChange={e => updateMaintenance(idx, { ...log, "Actividad realizada": e.target.value })} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Responsable" value={log.Responsable} onChange={e => updateMaintenance(idx, { ...log, Responsable: e.target.value })} />
                                <Input label="Observaciones" value={log.Observaciones} onChange={e => updateMaintenance(idx, { ...log, Observaciones: e.target.value })} />
                            </div>

                            {/* Photos Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Evidencia Fotográfica</span>
                                    <Button size="sm" variant="secondary" onClick={() => openPhotoModal(idx)} className="h-6 px-2 text-xs"><Camera size={12} className="mr-1" /> Gestionar Fotos ({(log.Fotografias || []).length})</Button>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {(log.Fotografias || []).map((photo, photoIdx) => (
                                        <div key={photoIdx} className="w-16 h-16 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0 cursor-zoom-in" onClick={() => setZoomedImage(photo)}>
                                            <img src={photo} alt="evidencia" className="w-full h-full object-cover transition-transform hover:scale-110" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1"><FileText size={14} /> Documentación Relacionada</span>
                                    <Button size="sm" variant="secondary" onClick={() => addDocumentToLog(idx)} className="h-6 px-2 text-xs"><Plus size={12} className="mr-1" /> Añadir Documento</Button>
                                </div>
                                <div className="space-y-2">
                                    {(log.documentos || []).map((doc, docIdx) => (
                                        <div key={docIdx} className="flex gap-2 items-start bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex-1 space-y-1">
                                                <Input
                                                    placeholder="Nombre del recurso (ej. Informe Técnico)"
                                                    value={doc.titulo}
                                                    onChange={e => updateDocumentInLog(idx, docIdx, 'titulo', e.target.value)}
                                                    className="text-sm font-medium h-7"
                                                />
                                                <Input
                                                    placeholder="URL (https://...)"
                                                    value={doc.url}
                                                    onChange={e => updateDocumentInLog(idx, docIdx, 'url', e.target.value)}
                                                    className="text-xs font-mono text-zinc-500 h-7"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 mt-1">
                                                {doc.url && (
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="icon" action="primary" title="Abrir enlace" size="icon-sm">
                                                            <ExternalLink size={14} />
                                                        </Button>
                                                    </a>
                                                )}
                                                <Button variant="icon" action="danger" onClick={() => removeDocumentFromLog(idx, docIdx)} title="Eliminar" size="icon-sm">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(log.documentos || []).length === 0 && <p className="text-zinc-400 text-xs italic">No hay documentos adjuntos a esta actividad.</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Maintenance Photo Modal */}
            <Modal
                isOpen={!!maintenancePhotoModal}
                onClose={() => setMaintenancePhotoModal(null)}
                title="Fotografías de Mantenimiento"
                footer={<Button onClick={() => setMaintenancePhotoModal(null)}>Cerrar</Button>}
            >
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="URL de imagen..."
                            value={newMaintPhotoUrl}
                            onChange={(e) => setNewMaintPhotoUrl(e.target.value)}
                        />
                        <Button onClick={addPhotoToLog} disabled={!newMaintPhotoUrl} size="sm"><Plus size={16} /></Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
                        {maintenancePhotoModal && (unit.mantenimientos || [])[maintenancePhotoModal.logIdx]?.Fotografias?.map((photo, pIdx) => (
                            <div key={pIdx} className="relative group aspect-square bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden cursor-zoom-in" onClick={() => setZoomedImage(photo)}>
                                <img src={photo} alt="evidencia" className="w-full h-full object-cover transition-transform hover:scale-105" />
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="icon" action="danger" size="icon-sm" className="bg-white/80 hover:bg-white" onClick={(e) => { e.stopPropagation(); removePhotoFromLog(maintenancePhotoModal.logIdx, pIdx); }}>
                                        <Trash2 size={10} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {maintenancePhotoModal && (!(unit.mantenimientos || [])[maintenancePhotoModal.logIdx]?.Fotografias?.length) && (
                            <div className="col-span-full text-center text-sm text-zinc-400 py-4">No hay fotos registradas.</div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* General Confirmation Modal for Maintenance */}
            <Modal
                isOpen={confirmationState.isOpen}
                onClose={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
                title={confirmationState.title}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}>Cancelar</Button>
                        <Button variant="danger" onClick={confirmationState.onConfirm}>Confirmar Eliminación</Button>
                    </>
                }
            >
                <p className="text-zinc-700 dark:text-zinc-300">{confirmationState.message}</p>
            </Modal>

            <ImageViewer
                isOpen={!!zoomedImage}
                onClose={() => setZoomedImage(null)}
                src={zoomedImage || ""}
            />

            {/* Copy Maintenance to Units Modal */}
            <Modal
                isOpen={!!copyModal}
                onClose={() => setCopyModal(null)}
                title="Copiar Registro a otras Unidades"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setCopyModal(null)}>Cancelar</Button>
                        <Button
                            onClick={copyMaintenanceToUnits}
                            disabled={!copyModal?.targetUnitIndices.length}
                        >
                            Copiar a {copyModal?.targetUnitIndices.length} unidades
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-zinc-500">Selecciona las unidades destino para este registro de mantenimiento. Se omitirán las unidades que ya tengan un registro idéntico (misma actividad y fecha).</p>

                    <div className="flex gap-2 mb-2">
                        <Button size="xs" variant="secondary" onClick={() => {
                            const allIndices = allUnits.map((_, i) => i).filter(i => allUnits[i] !== unit);
                            setCopyModal(prev => prev ? { ...prev, targetUnitIndices: allIndices } : null);
                        }}>Seleccionar Todas</Button>
                        <Button size="xs" variant="ghost" onClick={() => {
                            setCopyModal(prev => prev ? { ...prev, targetUnitIndices: [] } : null);
                        }}>Desmarcar Todas</Button>
                    </div>

                    <div className="max-h-[40vh] overflow-y-auto border rounded-md divide-y dark:border-zinc-700 dark:divide-zinc-700">
                        {allUnits.map((u, i) => {
                            if (u === unit) return null;
                            const isSelected = copyModal?.targetUnitIndices.includes(i);
                            return (
                                <div
                                    key={i}
                                    className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${isSelected ? 'bg-zinc-50 dark:bg-zinc-800' : ''}`}
                                    onClick={() => {
                                        setCopyModal(prev => {
                                            if (!prev) return null;
                                            const newIndices = isSelected
                                                ? prev.targetUnitIndices.filter(idx => idx !== i)
                                                : [...prev.targetUnitIndices, i];
                                            return { ...prev, targetUnitIndices: newIndices };
                                        });
                                    }}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                        {isSelected && <Check size={10} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{u.infoEquipo?.["Codigo Inventario Equipo"] || `Unidad ${i + 1}`}</div>
                                        <div className="text-xs text-zinc-400">{u.infoEquipo?.Ubicación || 'Sin ubicación'}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </div>
    );
};