import React, { useState, useMemo, useEffect } from 'react';
import { Lab, Equipo, Software, PersonalInfo, Documento } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { ImageViewer } from '../ui/ImageViewer';
import { ArrowLeft, Plus, Trash2, Save, Cpu, HardDrive, Users, UserCheck, UserCog, GraduationCap, Copy, ArrowRightLeft, Image as ImageIcon, ArrowUp, ArrowDown, FileText, ExternalLink, ChevronUp, ChevronDown, ListFilter, Hash, Tag } from 'lucide-react';
import { EquipmentDetail } from './EquipmentDetail';
import { SoftwareDetail } from './SoftwareDetail';

interface LabDetailProps {
    lab: Lab;
    allLabs?: Lab[];
    currentLabIndex?: number;
    onBack: () => void;
    onUpdate: (updatedLab: Lab) => void;
    onMoveEquipment?: (targetLabIndex: number, equipmentIndex: number, unitIndices?: number[]) => void;
    onMoveSoftware?: (targetLabIndex: number, softwareIndex: number) => void;
    onCopyEquipmentData?: (sourceEquipment: Equipo, targets: { labIndex: number, equipmentIndex: number }[], options: { fichaTecnica: boolean, procedimientos: boolean }) => void;
    initialEquipmentIndex?: number;
    initialSoftwareIndex?: number;
}

type Tab = 'INFO' | 'EQUIPOS' | 'SOFTWARE';

export const LabDetail: React.FC<LabDetailProps> = ({
    lab,
    allLabs,
    currentLabIndex,
    onBack,
    onUpdate,
    onMoveEquipment,
    onMoveSoftware,
    onCopyEquipmentData,
    initialEquipmentIndex,
    initialSoftwareIndex
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('INFO');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Lab>(lab);

    // Navigation State
    const [selectedEquipmentIndex, setSelectedEquipmentIndex] = useState<number | null>(null);
    const [selectedSoftwareIndex, setSelectedSoftwareIndex] = useState<number | null>(null);

    // --- FILTER & SORT STATE: EQUIPMENT ---
    const [eqFilters, setEqFilters] = useState({
        name: "",
        model: "",
        qty: "",
        inv: ""
    });
    const [eqSortConfig, setEqSortConfig] = useState<{ key: keyof Equipo | 'model' | 'inv'; direction: 'asc' | 'desc' } | null>(null);

    // --- FILTER & SORT STATE: SOFTWARE ---
    const [swFilters, setSwFilters] = useState({
        name: "",
        version: "",
        licenses: "",
        type: ""
    });
    const [swSortConfig, setSwSortConfig] = useState<{ key: keyof Software; direction: 'asc' | 'desc' } | null>(null);


    // Photo Modals State
    const [labPhotoModalOpen, setLabPhotoModalOpen] = useState(false);
    const [newLabPhotoUrl, setNewLabPhotoUrl] = useState("");

    // Image Viewer State
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Custom Confirmation Modal State
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => { } });


    // Move Equipment State
    const [moveModalState, setMoveModalState] = useState<{
        isOpen: boolean;
        equipmentIndex: number | null;
    }>({ isOpen: false, equipmentIndex: null });
    const [moveTargetLabIndex, setMoveTargetLabIndex] = useState<string>("");
    const [moveMode, setMoveMode] = useState<'ALL' | 'PARTIAL'>('ALL');
    const [selectedMoveUnits, setSelectedMoveUnits] = useState<number[]>([]);

    // Move Software State
    const [moveSoftwareModalState, setMoveSoftwareModalState] = useState<{
        isOpen: boolean;
        softwareIndex: number | null;
    }>({ isOpen: false, softwareIndex: null });
    const [moveSoftwareTargetLabIndex, setMoveSoftwareTargetLabIndex] = useState<string>("");


    // Update formData when prop lab changes (important for after moving equipment)
    useEffect(() => {
        setFormData(lab);
    }, [lab]);

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(lab);

    // Handle deep navigation (initial selections from global views)
    useEffect(() => {
        if (initialEquipmentIndex !== undefined) {
            setActiveTab('EQUIPOS');
            setSelectedEquipmentIndex(initialEquipmentIndex);
        } else if (initialSoftwareIndex !== undefined) {
            setActiveTab('SOFTWARE');
            setSelectedSoftwareIndex(initialSoftwareIndex);
        }
    }, [initialEquipmentIndex, initialSoftwareIndex]);

    // --- PROCESSING LISTS (FILTER/SORT) ---
    const processedEquipos = useMemo(() => {
        let items = (formData.equipos || []).map((item, index) => ({ ...item, originalIndex: index }));

        // Filters
        if (eqFilters.name) {
            const lower = eqFilters.name.toLowerCase();
            items = items.filter(i => (i["NOMBRE DEL EQUIPO"] || "").toLowerCase().includes(lower));
        }
        if (eqFilters.model) {
            const lower = eqFilters.model.toLowerCase();
            items = items.filter(i =>
                (i.infoEquipo?.Marca || "").toLowerCase().includes(lower) ||
                (i.infoEquipo?.Modelo || "").toLowerCase().includes(lower)
            );
        }
        if (eqFilters.qty) {
            items = items.filter(i => (i["Nº DE EQUIPOS"] || "").includes(eqFilters.qty));
        }
        if (eqFilters.inv) {
            items = items.filter(i => (i.HojasDeVidaEquipos || []).length.toString().includes(eqFilters.inv));
        }

        // Sort
        if (eqSortConfig) {
            items.sort((a, b) => {
                let valA: any = "";
                let valB: any = "";

                switch (eqSortConfig.key) {
                    case 'NOMBRE DEL EQUIPO': valA = a["NOMBRE DEL EQUIPO"] || ""; valB = b["NOMBRE DEL EQUIPO"] || ""; break;
                    case 'model':
                        valA = `${a.infoEquipo?.Marca} ${a.infoEquipo?.Modelo}`;
                        valB = `${b.infoEquipo?.Marca} ${b.infoEquipo?.Modelo}`;
                        break;
                    case 'Nº DE EQUIPOS':
                        valA = parseInt(a["Nº DE EQUIPOS"] || "0");
                        valB = parseInt(b["Nº DE EQUIPOS"] || "0");
                        break;
                    case 'inv':
                        valA = (a.HojasDeVidaEquipos || []).length;
                        valB = (b.HojasDeVidaEquipos || []).length;
                        break;
                    default: break;
                }

                if (valA < valB) return eqSortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return eqSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return items;
    }, [formData.equipos, eqFilters, eqSortConfig]);

    const processedSoftware = useMemo(() => {
        let items = (formData.software || []).map((item, index) => ({ ...item, originalIndex: index }));

        // Filters
        if (swFilters.name) {
            const lower = swFilters.name.toLowerCase();
            items = items.filter(i => (i["NOMBRE DEL SOFTWARE"] || "").toLowerCase().includes(lower));
        }
        if (swFilters.version) {
            const lower = swFilters.version.toLowerCase();
            items = items.filter(i => (i["VERSIÓN"] || "").toLowerCase().includes(lower));
        }
        if (swFilters.licenses) {
            items = items.filter(i => (i["Nº DE LICENCIAS"] || "").includes(swFilters.licenses));
        }
        if (swFilters.type) {
            const lower = swFilters.type.toLowerCase();
            items = items.filter(i => (i["TIPO DE LICENCIA"] || "").toLowerCase().includes(lower));
        }

        // Sort
        if (swSortConfig) {
            items.sort((a, b) => {
                let valA: any = "";
                let valB: any = "";

                switch (swSortConfig.key) {
                    case 'NOMBRE DEL SOFTWARE': valA = a["NOMBRE DEL SOFTWARE"] || ""; valB = b["NOMBRE DEL SOFTWARE"] || ""; break;
                    case 'VERSIÓN': valA = a["VERSIÓN"] || ""; valB = b["VERSIÓN"] || ""; break;
                    case 'Nº DE LICENCIAS':
                        valA = parseInt(a["Nº DE LICENCIAS"] || "0");
                        valB = parseInt(b["Nº DE LICENCIAS"] || "0");
                        break;
                    case 'TIPO DE LICENCIA': valA = a["TIPO DE LICENCIA"] || ""; valB = b["TIPO DE LICENCIA"] || ""; break;
                    default: break;
                }

                if (valA < valB) return swSortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return swSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return items;
    }, [formData.software, swFilters, swSortConfig]);

    // --- SORT HANDLERS ---
    const handleEqSort = (key: keyof Equipo | 'model' | 'inv') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (eqSortConfig && eqSortConfig.key === key && eqSortConfig.direction === 'asc') direction = 'desc';
        setEqSortConfig({ key, direction });
    };

    const handleSwSort = (key: keyof Software) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (swSortConfig && swSortConfig.key === key && swSortConfig.direction === 'asc') direction = 'desc';
        setSwSortConfig({ key, direction });
    };

    const renderSortIcon = (key: string, currentConfig: any) => {
        if (currentConfig?.key !== key) return <ListFilter size={12} className="opacity-30" />;
        return currentConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
    };


    // --- GENERAL INFO LOGIC ---
    const handleChange = (section: keyof Lab['infoAmbiente'], value: string) => {
        setFormData(prev => ({
            ...prev,
            infoAmbiente: { ...(prev.infoAmbiente || {}), [section]: value }
        } as Lab));
    };

    const handlePersonalChange = (
        section: 'RESPONSABLE DEL LABORATORIO O TALLER' | 'PERSONAL ASIGNADO PARA VERIFICAR LA CBC III',
        field: keyof PersonalInfo,
        value: string
    ) => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const personal = info[section] || {};
            return {
                ...prev,
                infoAmbiente: {
                    ...info,
                    [section]: { ...personal, [field]: value }
                }
            } as Lab;
        });
    };

    const addTechStaff = () => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const staff = info["PERSONAL TÉCNICO"] || [];
            return {
                ...prev,
                infoAmbiente: { ...info, "PERSONAL TÉCNICO": [...staff, { "NOMBRE": "", "NUMERO DE CONTACTO": "" }] }
            } as Lab;
        });
    };

    const updateTechStaff = (index: number, field: keyof PersonalInfo, value: string) => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const staff = [...(info["PERSONAL TÉCNICO"] || [])];
            staff[index] = { ...staff[index], [field]: value };
            return {
                ...prev,
                infoAmbiente: { ...info, "PERSONAL TÉCNICO": staff }
            } as Lab;
        });
    };

    const removeTechStaff = (index: number) => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const staff = (info["PERSONAL TÉCNICO"] || []).filter((_, i) => i !== index);
            return {
                ...prev,
                infoAmbiente: { ...info, "PERSONAL TÉCNICO": staff }
            } as Lab;
        });
    };

    const addProgram = () => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const programs = info["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"] || [];
            return {
                ...prev,
                infoAmbiente: { ...info, "PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER": [...programs, ""] }
            } as Lab;
        });
    };

    const updateProgram = (index: number, value: string) => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const programs = [...(info["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"] || [])];
            programs[index] = value;
            return {
                ...prev,
                infoAmbiente: { ...info, "PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER": programs }
            } as Lab;
        });
    };

    const removeProgram = (index: number) => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const programs = (info["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"] || []).filter((_, i) => i !== index);
            return {
                ...prev,
                infoAmbiente: { ...info, "PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER": programs }
            } as Lab;
        });
    };

    // Lab Photos Logic
    const addLabPhoto = () => {
        if (newLabPhotoUrl.trim()) {
            setFormData(prev => {
                const info = prev.infoAmbiente || {};
                const photos = info.Fotografias || [];
                return {
                    ...prev,
                    infoAmbiente: { ...info, Fotografias: [...photos, newLabPhotoUrl.trim()] }
                } as Lab;
            });
            setNewLabPhotoUrl("");
            setLabPhotoModalOpen(false);
        }
    };

    const removeLabPhoto = (idx: number) => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const photos = (info.Fotografias || []).filter((_, i) => i !== idx);
            return {
                ...prev,
                infoAmbiente: { ...info, Fotografias: photos }
            } as Lab;
        });
    };

    // Document Logic for Labs
    const addDocument = () => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const docs = info.documentos || [];
            return {
                ...prev,
                infoAmbiente: { ...info, documentos: [...docs, { titulo: "", url: "" }] }
            } as Lab;
        });
    };

    const updateDocument = (idx: number, key: keyof Documento, value: string) => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const docs = [...(info.documentos || [])];
            docs[idx] = { ...docs[idx], [key]: value };
            return {
                ...prev,
                infoAmbiente: { ...info, documentos: docs }
            } as Lab;
        });
    };

    const removeDocument = (idx: number) => {
        setFormData(prev => {
            const info = prev.infoAmbiente || {};
            const docs = (info.documentos || []).filter((_, i) => i !== idx);
            return {
                ...prev,
                infoAmbiente: { ...info, documentos: docs }
            } as Lab;
        });
    };


    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const getInfo = (key: keyof Lab['infoAmbiente']): string => {
        const val = formData.infoAmbiente?.[key];
        if (typeof val === 'string') return val;
        return "";
    };

    const getResponsible = () => formData.infoAmbiente?.["RESPONSABLE DEL LABORATORIO O TALLER"] || { NOMBRE: "", "NUMERO DE CONTACTO": "" };
    const getCBC = () => formData.infoAmbiente?.["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"] || { NOMBRE: "", "NUMERO DE CONTACTO": "" };
    const getTechStaff = () => formData.infoAmbiente?.["PERSONAL TÉCNICO"] || [];
    const getPrograms = () => formData.infoAmbiente?.["PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER"] || [];
    const getLabPhotos = () => formData.infoAmbiente?.Fotografias || [];
    const getDocuments = () => formData.infoAmbiente?.documentos || [];


    // --- EQUIPMENT LOGIC ---
    const addMockEquipment = () => {
        const newEq: Equipo = {
            "Nº DE EQUIPOS": "1",
            "NOMBRE DEL EQUIPO": "NUEVO EQUIPO",
            "COMENTARIOS": "",
            "infoEquipo": { "Denominacion Patrimonial": "", "Tipo de equipo:": "", "Fabricante": "", "Marca": "", "Modelo": "" },
            "Fotografias": [],
            "caracteristicas": [],
            "ProcedimientoMantenimiento": {
                "Principio de Operacion": "",
                "Instalaciones Requeridas": "",
                "Partes": "",
                "mantenimiento": { "preventivo": {}, "correctivo": {} }
            },
            "HojasDeVidaEquipos": []
        };
        const newLabs = { ...formData, equipos: [...(formData.equipos || []), newEq] };
        setFormData(newLabs);
        onUpdate(newLabs);
        // Clear filters to see the new item
        setEqFilters({ name: "", model: "", qty: "", inv: "" });
        setSelectedEquipmentIndex((newLabs.equipos || []).length - 1);
    };

    const updateEquipment = (updatedEq: Equipo) => {
        if (selectedEquipmentIndex !== null) {
            const newEquipos = [...(formData.equipos || [])];
            newEquipos[selectedEquipmentIndex] = updatedEq;
            const newData = { ...formData, equipos: newEquipos };
            setFormData(newData);
            onUpdate(newData);
        }
    };

    const deleteEquipment = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmationState({
            isOpen: true,
            title: "Eliminar Equipo",
            message: "¿Estás seguro de eliminar este tipo de equipo y todo su historial de unidades y mantenimientos? Esta acción no se puede deshacer.",
            onConfirm: () => {
                const updatedEquipos = (formData.equipos || []).filter((_, i) => i !== idx);
                const newData = { ...formData, equipos: updatedEquipos };
                setFormData(newData);
                onUpdate(newData);
                setConfirmationState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const duplicateEquipment = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const eqToCopy = (formData.equipos || [])[idx];
        const newEq = JSON.parse(JSON.stringify(eqToCopy));
        newEq["NOMBRE DEL EQUIPO"] = `${newEq["NOMBRE DEL EQUIPO"]} (Copia)`;

        const newEquipos = [...(formData.equipos || [])];
        newEquipos.splice(idx + 1, 0, newEq);

        const newData = { ...formData, equipos: newEquipos };
        setFormData(newData);
        onUpdate(newData);
    };

    const moveEquipmentOrder = (idx: number, direction: 'UP' | 'DOWN', e: React.MouseEvent) => {
        e.stopPropagation();
        const newEquipos = [...(formData.equipos || [])];

        if (direction === 'UP' && idx > 0) {
            [newEquipos[idx], newEquipos[idx - 1]] = [newEquipos[idx - 1], newEquipos[idx]];
        } else if (direction === 'DOWN' && idx < newEquipos.length - 1) {
            [newEquipos[idx], newEquipos[idx + 1]] = [newEquipos[idx + 1], newEquipos[idx]];
        }

        const newData = { ...formData, equipos: newEquipos };
        setFormData(newData);
        onUpdate(newData);
    };

    const openMoveModal = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setMoveModalState({ isOpen: true, equipmentIndex: idx });
        setMoveTargetLabIndex("");
        setMoveMode('ALL');
        setSelectedMoveUnits([]);
    };

    const executeMove = () => {
        if (moveTargetLabIndex === "" || moveModalState.equipmentIndex === null || !onMoveEquipment) return;

        const targetIdx = parseInt(moveTargetLabIndex);
        const eqIdx = moveModalState.equipmentIndex;

        if (moveMode === 'ALL') {
            onMoveEquipment(targetIdx, eqIdx);
        } else {
            onMoveEquipment(targetIdx, eqIdx, selectedMoveUnits);
        }

        setMoveModalState({ isOpen: false, equipmentIndex: null });
    };

    const toggleMoveUnit = (unitIdx: number) => {
        setSelectedMoveUnits(prev => {
            if (prev.includes(unitIdx)) return prev.filter(i => i !== unitIdx);
            return [...prev, unitIdx];
        });
    };

    // --- SOFTWARE LOGIC ---
    const addMockSoftware = () => {
        const newSw: Software = {
            "Nº DE LICENCIAS": "1",
            "VERSIÓN": "",
            "NOMBRE DEL SOFTWARE": "Nuevo Software",
            "TIPO DE LICENCIA": "",
            "COMENTARIOS": "",
            "Fotografias": []
        };
        const newLabs = { ...formData, software: [...(formData.software || []), newSw] };
        setFormData(newLabs);
        onUpdate(newLabs);
        setSwFilters({ name: "", version: "", licenses: "", type: "" });
        setSelectedSoftwareIndex((newLabs.software || []).length - 1);
    };

    const updateSoftware = (updatedSw: Software) => {
        if (selectedSoftwareIndex !== null) {
            const newSoftware = [...(formData.software || [])];
            newSoftware[selectedSoftwareIndex] = updatedSw;
            const newData = { ...formData, software: newSoftware };
            setFormData(newData);
            onUpdate(newData);
        }
    };

    const deleteSoftware = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmationState({
            isOpen: true,
            title: "Eliminar Software",
            message: "¿Estás seguro de eliminar este software del inventario?",
            onConfirm: () => {
                const updatedSoftware = (formData.software || []).filter((_, i) => i !== idx);
                const newData = { ...formData, software: updatedSoftware };
                setFormData(newData);
                onUpdate(newData);
                setConfirmationState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const duplicateSoftware = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const swToCopy = (formData.software || [])[idx];
        const newSw = JSON.parse(JSON.stringify(swToCopy));
        newSw["NOMBRE DEL SOFTWARE"] = `${newSw["NOMBRE DEL SOFTWARE"]} (Copia)`;

        const newSoftwareList = [...(formData.software || [])];
        newSoftwareList.splice(idx + 1, 0, newSw);

        const newData = { ...formData, software: newSoftwareList };
        setFormData(newData);
        onUpdate(newData);
    };

    const openMoveSoftwareModal = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setMoveSoftwareModalState({ isOpen: true, softwareIndex: idx });
        setMoveSoftwareTargetLabIndex("");
    };

    const executeMoveSoftware = () => {
        if (moveSoftwareTargetLabIndex === "" || moveSoftwareModalState.softwareIndex === null || !onMoveSoftware) return;

        const targetIdx = parseInt(moveSoftwareTargetLabIndex);
        const swIdx = moveSoftwareModalState.softwareIndex;

        onMoveSoftware(targetIdx, swIdx);
        setMoveSoftwareModalState({ isOpen: false, softwareIndex: null });
    };


    // --- RENDER: EQUIPMENT DETAIL VIEW ---
    if (selectedEquipmentIndex !== null && formData.equipos?.[selectedEquipmentIndex]) {
        return (
            <EquipmentDetail
                equipment={formData.equipos[selectedEquipmentIndex]}
                allLabs={allLabs}
                currentLabIndex={currentLabIndex}
                onUpdate={updateEquipment}
                onCopyEquipmentData={onCopyEquipmentData}
                onBack={() => setSelectedEquipmentIndex(null)}
            />
        );
    }

    // --- RENDER: SOFTWARE DETAIL VIEW ---
    if (selectedSoftwareIndex !== null && formData.software?.[selectedSoftwareIndex]) {
        return (
            <SoftwareDetail
                software={formData.software[selectedSoftwareIndex]}
                onUpdate={updateSoftware}
                onBack={() => setSelectedSoftwareIndex(null)}
            />
        );
    }

    // --- RENDER: MAIN LAB VIEW ---
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {getInfo("NOMBRE DEL LABORATORIO O TALLER") || "Nuevo Laboratorio"}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {getInfo("CÓDIGO DE LABORATORIO O TALLER")}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'INFO' && !isEditing && (
                        <Button variant="secondary" onClick={() => setIsEditing(true)}>Editar Info</Button>
                    )}
                    {activeTab === 'INFO' && isEditing && (
                        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
                            <Save size={16} /> Guardar
                            {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-1" />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'INFO' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                    onClick={() => setActiveTab('INFO')}
                >
                    Información General
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'EQUIPOS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                    onClick={() => setActiveTab('EQUIPOS')}
                >
                    Equipos ({(formData.equipos || []).length})
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'SOFTWARE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                    onClick={() => setActiveTab('SOFTWARE')}
                >
                    Software ({(formData.software || []).length})
                </button>
            </div>

            {/* Content */}
            <div className="pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'INFO' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                        {/* Columna Izquierda */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Identificación y Ubicación</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Input label="Nombre del Laboratorio" value={getInfo("NOMBRE DEL LABORATORIO O TALLER")} onChange={(e) => handleChange("NOMBRE DEL LABORATORIO O TALLER", e.target.value)} disabled={!isEditing} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Código" value={getInfo("CÓDIGO DE LABORATORIO O TALLER")} onChange={(e) => handleChange("CÓDIGO DE LABORATORIO O TALLER", e.target.value)} disabled={!isEditing} />
                                        <Input label="Nro. Laboratorio" value={getInfo("NUMERO DE LABORATORIO O TALLER")} onChange={(e) => handleChange("NUMERO DE LABORATORIO O TALLER", e.target.value)} disabled={!isEditing} />
                                    </div>
                                    <Input label="Referencia Ubicación" value={getInfo("REFERENCIA DE UBICACIÓN")} onChange={(e) => handleChange("REFERENCIA DE UBICACIÓN", e.target.value)} disabled={!isEditing} />
                                    <Input label="Código Patrimonio Ambiente" value={getInfo("CODIGO PATRIMONIO AMBIENTE")} onChange={(e) => handleChange("CODIGO PATRIMONIO AMBIENTE", e.target.value)} disabled={!isEditing} />
                                    <Input label="Tipo" value={getInfo("TIPO DE LABORATORIO O TALLER")} onChange={(e) => handleChange("TIPO DE LABORATORIO O TALLER", e.target.value)} disabled={!isEditing} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Métricas y Capacidad</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Aforo" value={getInfo("AFORO")} onChange={(e) => handleChange("AFORO", e.target.value)} disabled={!isEditing} />
                                        <Input label="Área (m2)" value={getInfo("ÁREA (m2)")} onChange={(e) => handleChange("ÁREA (m2)", e.target.value)} disabled={!isEditing} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Internet (Sí/No)" value={getInfo("SERVICIO DE INTERNET (SI/NO)")} onChange={(e) => handleChange("SERVICIO DE INTERNET (SI/NO)", e.target.value)} disabled={!isEditing} />
                                        <Input label="Cant. Programas" value={getInfo("CANTIDAD DE PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER")} onChange={(e) => handleChange("CANTIDAD DE PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER", e.target.value)} disabled={!isEditing} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2"><GraduationCap size={18} /> Programas que usan el ambiente</CardTitle>
                                        {isEditing && <Button size="sm" variant="secondary" onClick={addProgram}><Plus size={14} /></Button>}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {getPrograms().map((prog, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input value={prog} onChange={(e) => updateProgram(idx, e.target.value)} disabled={!isEditing} placeholder="Código Programa (ej. P13)" />
                                            {isEditing && (
                                                <Button variant="icon" action="danger" size="sm" onClick={() => removeProgram(idx)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {getPrograms().length === 0 && <p className="text-sm text-zinc-500 italic">No hay programas asignados.</p>}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Columna Derecha */}
                        <div className="space-y-6">
                            {/* Lab Photos */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon size={18} /> Fotografías del Laboratorio</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {getLabPhotos().map((photo, idx) => (
                                            <div key={idx} className="relative group aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-zoom-in" onClick={() => setZoomedImage(photo)}>
                                                <img src={photo} alt="Lab" className="w-full h-full object-cover transition-transform hover:scale-105" />
                                                {isEditing && (
                                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="icon" action="danger" size="icon-sm" className="bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80" onClick={(e) => { e.stopPropagation(); removeLabPhoto(idx); }}>
                                                            <Trash2 size={12} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {isEditing && (
                                            <button
                                                onClick={() => setLabPhotoModalOpen(true)}
                                                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400"
                                            >
                                                <Plus size={24} />
                                                <span className="text-[10px] mt-1 text-center">Añadir</span>
                                            </button>
                                        )}
                                    </div>
                                    {getLabPhotos().length === 0 && !isEditing && <p className="text-sm text-zinc-500 italic">No hay fotografías.</p>}
                                </CardContent>
                            </Card>

                            {/* Document Section */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2"><FileText size={18} /> Documentación y Enlaces</CardTitle>
                                        {isEditing && <Button size="sm" variant="secondary" onClick={addDocument}><Plus size={14} /></Button>}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {getDocuments().map((doc, idx) => (
                                        <div key={idx} className="flex gap-2 items-start bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex-1 space-y-1">
                                                <Input
                                                    placeholder="Título (ej. Plano de Distribución)"
                                                    value={doc.titulo}
                                                    onChange={e => updateDocument(idx, 'titulo', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="text-sm font-medium"
                                                />
                                                <Input
                                                    placeholder="URL (https://...)"
                                                    value={doc.url}
                                                    onChange={e => updateDocument(idx, 'url', e.target.value)}
                                                    disabled={!isEditing}
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
                                                {isEditing && (
                                                    <Button variant="icon" action="danger" onClick={() => removeDocument(idx)} title="Eliminar">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {getDocuments().length === 0 && <p className="text-zinc-500 text-sm italic">No hay documentos registrados.</p>}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Users size={18} /> Responsables</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800">
                                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><UserCheck size={16} /> Responsable del Laboratorio</h4>
                                        <div className="space-y-2">
                                            <Input label="Nombre" value={getResponsible().NOMBRE} onChange={(e) => handlePersonalChange('RESPONSABLE DEL LABORATORIO O TALLER', 'NOMBRE', e.target.value)} disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                            <Input label="Contacto" value={getResponsible()["NUMERO DE CONTACTO"]} onChange={(e) => handlePersonalChange('RESPONSABLE DEL LABORATORIO O TALLER', 'NUMERO DE CONTACTO', e.target.value)} disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md border border-purple-100 dark:border-purple-800">
                                        <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2"><UserCog size={16} /> Verificación CBC III</h4>
                                        <div className="space-y-2">
                                            <Input label="Nombre" value={getCBC().NOMBRE} onChange={(e) => handlePersonalChange('PERSONAL ASIGNADO PARA VERIFICAR LA CBC III', 'NOMBRE', e.target.value)} disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                            <Input label="Contacto" value={getCBC()["NUMERO DE CONTACTO"]} onChange={(e) => handlePersonalChange('PERSONAL ASIGNADO PARA VERIFICAR LA CBC III', 'NUMERO DE CONTACTO', e.target.value)} disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2"><Users size={18} /> Personal Técnico</CardTitle>
                                        {isEditing && <Button size="sm" variant="secondary" onClick={addTechStaff}><Plus size={14} /></Button>}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {getTechStaff().map((staff, idx) => (
                                        <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 relative group">
                                            <div className="grid grid-cols-1 gap-2">
                                                <Input placeholder="Nombre Técnico" value={staff.NOMBRE} onChange={(e) => updateTechStaff(idx, 'NOMBRE', e.target.value)} disabled={!isEditing} className="text-sm" />
                                                <Input placeholder="Contacto" value={staff["NUMERO DE CONTACTO"]} onChange={(e) => updateTechStaff(idx, 'NUMERO DE CONTACTO', e.target.value)} disabled={!isEditing} className="text-sm" />
                                            </div>
                                            {isEditing && (
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="icon" action="danger" size="icon-sm" onClick={() => removeTechStaff(idx)}>
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {getTechStaff().length === 0 && <p className="text-sm text-zinc-500 italic">No hay personal técnico asignado.</p>}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Notas Adicionales</CardTitle></CardHeader>
                                <CardContent>
                                    <Input textarea label="Comentarios" value={getInfo("COMENTARIOS")} onChange={(e) => handleChange("COMENTARIOS", e.target.value)} disabled={!isEditing} rows={4} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* --- TAB: EQUIPOS (TABLE VIEW) --- */}
                {activeTab === 'EQUIPOS' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Listado de Equipos</h3>
                            <Button onClick={addMockEquipment} size="sm"><Plus size={16} className="mr-2" /> Añadir Equipo</Button>
                        </div>

                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                                            <tr>
                                                <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleEqSort('NOMBRE DEL EQUIPO')}>
                                                    <div className="flex items-center gap-2">Nombre {renderSortIcon('NOMBRE DEL EQUIPO', eqSortConfig)}</div>
                                                </th>
                                                <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleEqSort('model')}>
                                                    <div className="flex items-center gap-2">Marca / Modelo {renderSortIcon('model', eqSortConfig)}</div>
                                                </th>
                                                <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 w-24" onClick={() => handleEqSort('Nº DE EQUIPOS')}>
                                                    <div className="flex items-center gap-2">Cant {renderSortIcon('Nº DE EQUIPOS', eqSortConfig)}</div>
                                                </th>
                                                <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 w-24" onClick={() => handleEqSort('inv')}>
                                                    <div className="flex items-center gap-2">Inv {renderSortIcon('inv', eqSortConfig)}</div>
                                                </th>
                                                <th className="px-6 py-3 font-medium text-right">Acciones</th>
                                            </tr>
                                            <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                                <th className="px-4 py-2">
                                                    <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro nombre..." value={eqFilters.name} onChange={e => setEqFilters({ ...eqFilters, name: e.target.value })} />
                                                </th>
                                                <th className="px-4 py-2">
                                                    <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro marca/modelo..." value={eqFilters.model} onChange={e => setEqFilters({ ...eqFilters, model: e.target.value })} />
                                                </th>
                                                <th className="px-4 py-2">
                                                    <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="#" value={eqFilters.qty} onChange={e => setEqFilters({ ...eqFilters, qty: e.target.value })} />
                                                </th>
                                                <th className="px-4 py-2">
                                                    <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="#" value={eqFilters.inv} onChange={e => setEqFilters({ ...eqFilters, inv: e.target.value })} />
                                                </th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {processedEquipos.length === 0 ? (
                                                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No se encontraron equipos.</td></tr>
                                            ) : (
                                                processedEquipos.map((eq) => {
                                                    const idx = eq.originalIndex;
                                                    return (
                                                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer group" onClick={() => setSelectedEquipmentIndex(idx)}>
                                                            <td className="px-6 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center shrink-0 overflow-hidden">
                                                                        {eq.Fotografias?.[0] ? <img src={eq.Fotografias[0]} alt="eq" className="w-full h-full object-cover" /> : <Cpu size={16} className="text-zinc-400" />}
                                                                    </div>
                                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{eq["NOMBRE DEL EQUIPO"] || "Sin nombre"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                                                                {eq.infoEquipo?.Marca || "-"} {eq.infoEquipo?.Modelo || ""}
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs font-mono">{eq["Nº DE EQUIPOS"] || "0"}</span>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-mono">{(eq.HojasDeVidaEquipos || []).length}</span>
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {/* Reorder only if no filter/sort */}
                                                                    {(!eqFilters.name && !eqFilters.model && !eqFilters.qty && !eqFilters.inv && !eqSortConfig) && (
                                                                        <div className="flex mr-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                                                                            <Button variant="icon" action="primary" size="icon-md" onClick={(e) => moveEquipmentOrder(idx, 'UP', e)} disabled={idx === 0}><ArrowUp size={14} /></Button>
                                                                            <Button variant="icon" action="primary" size="icon-md" onClick={(e) => moveEquipmentOrder(idx, 'DOWN', e)} disabled={idx === (formData.equipos || []).length - 1}><ArrowDown size={14} /></Button>
                                                                        </div>
                                                                    )}
                                                                    <Button variant="icon" action="primary" size="icon-md" onClick={(e) => openMoveModal(idx, e)} title="Mover"><ArrowRightLeft size={16} /></Button>
                                                                    <Button variant="icon" action="primary" size="icon-md" onClick={(e) => duplicateEquipment(idx, e)} title="Duplicar"><Copy size={16} /></Button>
                                                                    <Button variant="icon" action="danger" size="icon-md" onClick={(e) => deleteEquipment(idx, e)} title="Eliminar"><Trash2 size={16} /></Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* --- TAB: SOFTWARE (TABLE VIEW) --- */}
                {activeTab === 'SOFTWARE' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Licencias de Software</h3>
                            <Button onClick={addMockSoftware} size="sm"><Plus size={16} className="mr-2" /> Añadir Software</Button>
                        </div>

                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                                            <tr>
                                                <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleSwSort('NOMBRE DEL SOFTWARE')}>
                                                    <div className="flex items-center gap-2">Software {renderSortIcon('NOMBRE DEL SOFTWARE', swSortConfig)}</div>
                                                </th>
                                                <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 w-24" onClick={() => handleSwSort('VERSIÓN')}>
                                                    <div className="flex items-center gap-2">Ver {renderSortIcon('VERSIÓN', swSortConfig)}</div>
                                                </th>
                                                <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 w-24" onClick={() => handleSwSort('Nº DE LICENCIAS')}>
                                                    <div className="flex items-center gap-2">Lic {renderSortIcon('Nº DE LICENCIAS', swSortConfig)}</div>
                                                </th>
                                                <th className="px-6 py-3 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleSwSort('TIPO DE LICENCIA')}>
                                                    <div className="flex items-center gap-2">Tipo {renderSortIcon('TIPO DE LICENCIA', swSortConfig)}</div>
                                                </th>
                                                <th className="px-6 py-3 font-medium text-right">Acciones</th>
                                            </tr>
                                            <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                                <th className="px-4 py-2">
                                                    <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Filtro nombre..." value={swFilters.name} onChange={e => setSwFilters({ ...swFilters, name: e.target.value })} />
                                                </th>
                                                <th className="px-4 py-2">
                                                    <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="v..." value={swFilters.version} onChange={e => setSwFilters({ ...swFilters, version: e.target.value })} />
                                                </th>
                                                <th className="px-4 py-2">
                                                    <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="#" value={swFilters.licenses} onChange={e => setSwFilters({ ...swFilters, licenses: e.target.value })} />
                                                </th>
                                                <th className="px-4 py-2">
                                                    <input className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Tipo..." value={swFilters.type} onChange={e => setSwFilters({ ...swFilters, type: e.target.value })} />
                                                </th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {processedSoftware.length === 0 ? (
                                                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No se encontraron programas.</td></tr>
                                            ) : (
                                                processedSoftware.map((sw) => {
                                                    const idx = sw.originalIndex;
                                                    return (
                                                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer group" onClick={() => setSelectedSoftwareIndex(idx)}>
                                                            <td className="px-6 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center text-purple-600 dark:text-purple-300 overflow-hidden shrink-0">
                                                                        {sw.Fotografias?.[0] ? <img src={sw.Fotografias[0]} alt="sw" className="w-full h-full object-cover" /> : <HardDrive size={16} />}
                                                                    </div>
                                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{sw["NOMBRE DEL SOFTWARE"] || "Sin nombre"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                                                                v{sw["VERSIÓN"] || "?"}
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-mono">{sw["Nº DE LICENCIAS"] || "0"}</span>
                                                            </td>
                                                            <td className="px-6 py-3 text-zinc-500 text-xs">
                                                                {sw["TIPO DE LICENCIA"] || "-"}
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="icon" action="primary" size="icon-md" onClick={(e) => openMoveSoftwareModal(idx, e)} title="Mover"><ArrowRightLeft size={16} /></Button>
                                                                    <Button variant="icon" action="primary" size="icon-md" onClick={(e) => duplicateSoftware(idx, e)} title="Duplicar"><Copy size={16} /></Button>
                                                                    <Button variant="icon" action="danger" size="icon-md" onClick={(e) => deleteSoftware(idx, e)} title="Eliminar"><Trash2 size={16} /></Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Move Equipment Modal */}
            <Modal
                isOpen={moveModalState.isOpen}
                onClose={() => setMoveModalState({ isOpen: false, equipmentIndex: null })}
                title="Mover Equipo a Otro Laboratorio"
                footer={<>
                    <Button variant="ghost" onClick={() => setMoveModalState({ isOpen: false, equipmentIndex: null })}>Cancelar</Button>
                    <Button onClick={executeMove} disabled={!moveTargetLabIndex || (moveMode === 'PARTIAL' && selectedMoveUnits.length === 0)}>Mover</Button>
                </>}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Seleccione el laboratorio de destino:</label>
                        <select
                            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                            value={moveTargetLabIndex}
                            onChange={(e) => setMoveTargetLabIndex(e.target.value)}
                        >
                            <option value="">-- Seleccionar Laboratorio --</option>
                            {allLabs && allLabs.map((l, idx) => (
                                idx !== currentLabIndex ? (
                                    <option key={idx} value={idx}>
                                        {l.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"]} - {l.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"]}
                                    </option>
                                ) : null
                            ))}
                        </select>
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Modo de traslado:</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="moveMode"
                                    checked={moveMode === 'ALL'}
                                    onChange={() => setMoveMode('ALL')}
                                />
                                Mover todo el equipo (y todas sus unidades)
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="moveMode"
                                    checked={moveMode === 'PARTIAL'}
                                    onChange={() => setMoveMode('PARTIAL')}
                                />
                                Mover solo algunas unidades
                            </label>
                        </div>
                    </div>

                    {moveMode === 'PARTIAL' && moveModalState.equipmentIndex !== null && (
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-md border border-zinc-200 dark:border-zinc-700 max-h-60 overflow-y-auto">
                            <p className="text-xs text-zinc-500 mb-2">Seleccione las unidades a mover:</p>
                            {(formData.equipos?.[moveModalState.equipmentIndex]?.HojasDeVidaEquipos || []).length === 0 ? (
                                <p className="text-sm text-red-500">Este equipo no tiene unidades inventariadas.</p>
                            ) : (
                                (formData.equipos?.[moveModalState.equipmentIndex]?.HojasDeVidaEquipos || []).map((unit, idx) => (
                                    <label key={idx} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 px-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedMoveUnits.includes(idx)}
                                            onChange={() => toggleMoveUnit(idx)}
                                        />
                                        <span className="font-mono text-zinc-600 dark:text-zinc-400">{unit.infoEquipo?.["Codigo Inventario Equipo"]}</span>
                                        <span>{unit.infoEquipo?.Ubicación ? `- ${unit.infoEquipo.Ubicación}` : ''}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Move Software Modal */}
            <Modal
                isOpen={moveSoftwareModalState.isOpen}
                onClose={() => setMoveSoftwareModalState({ isOpen: false, softwareIndex: null })}
                title="Mover Software a Otro Laboratorio"
                footer={<>
                    <Button variant="ghost" onClick={() => setMoveSoftwareModalState({ isOpen: false, softwareIndex: null })}>Cancelar</Button>
                    <Button onClick={executeMoveSoftware} disabled={!moveSoftwareTargetLabIndex}>Mover</Button>
                </>}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Seleccione el laboratorio de destino:</label>
                        <select
                            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                            value={moveSoftwareTargetLabIndex}
                            onChange={(e) => setMoveSoftwareTargetLabIndex(e.target.value)}
                        >
                            <option value="">-- Seleccionar Laboratorio --</option>
                            {allLabs && allLabs.map((l, idx) => (
                                idx !== currentLabIndex ? (
                                    <option key={idx} value={idx}>
                                        {l.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"]} - {l.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"]}
                                    </option>
                                ) : null
                            ))}
                        </select>
                    </div>
                    <p className="text-xs text-zinc-500">Se moverá la entrada completa del software y todas sus licencias.</p>
                </div>
            </Modal>

            {/* General Confirmation Modal */}
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

            {/* Lab Photo Viewer */}
            <ImageViewer
                isOpen={!!zoomedImage}
                onClose={() => setZoomedImage(null)}
                src={zoomedImage || ""}
            />
        </div>
    );
};