import React, { useState, useEffect } from 'react';
import { UniversityData, ThemeMode, ViewType, Lab, Equipo } from './types';
import { DEFAULT_DATA } from './constants';
import { MenuBar } from './components/Layout/MenuBar';
import { Dashboard } from './components/Views/Dashboard';
import { LabList } from './components/Views/LabList';
import { LabDetail } from './components/Views/LabDetail';
import { Settings as SettingsView } from './components/Views/Settings';
import { GlobalEquipmentList } from './components/Views/GlobalEquipmentList';
import { GlobalSoftwareList } from './components/Views/GlobalSoftwareList';
import { GlobalPersonnelList } from './components/Views/GlobalPersonnelList';
import { MaintenancePlan } from './components/Views/MaintenancePlan';
import { MaintenanceLogs } from './components/Views/MaintenanceLogs';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { LayoutDashboard, FlaskConical, Settings, Cpu, Save, Users, CalendarRange, ClipboardCheck } from 'lucide-react';

const App: React.FC = () => {
    const [data, setData] = useState<UniversityData>(DEFAULT_DATA);
    const [theme, setTheme] = useState<ThemeMode>('system');
    const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
    const [selectedLabIndex, setSelectedLabIndex] = useState<number | null>(null);

    // Navigation Target State (for deep linking from global lists)
    const [navTarget, setNavTarget] = useState<{
        equipmentIndex?: number;
        softwareIndex?: number;
    } | null>(null);

    // File Name State
    const [fileName, setFileName] = useState("data_lims");

    // Sidebar state
    // true = Expanded (Desktop: 64, Mobile: Visible)
    // false = Collapsed (Desktop: 20/Icons, Mobile: Hidden)
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
    const [tempFileName, setTempFileName] = useState("");
    const [labToDelete, setLabToDelete] = useState<number | null>(null);

    // Auto-save state
    const [autoSave, setAutoSave] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        const savedData = localStorage.getItem('nicelims_data');
        const savedFileName = localStorage.getItem('nicelims_filename');
        const savedAutoSave = localStorage.getItem('nicelims_autosave');

        if (savedData) {
            try {
                setData(JSON.parse(savedData));
            } catch (e) {
                console.error("Failed to parse saved data");
            }
        }
        if (savedFileName) {
            setFileName(savedFileName);
        }
        if (savedAutoSave) {
            setAutoSave(savedAutoSave === 'true');
        }
        setIsInitialized(true);
    }, []);

    // Auto-save effect
    useEffect(() => {
        if (!isInitialized) return;

        if (autoSave) {
            localStorage.setItem('nicelims_data', JSON.stringify(data));
            localStorage.setItem('nicelims_filename', fileName);
            setHasUnsavedChanges(false);
        } else {
            const savedData = localStorage.getItem('nicelims_data');
            const savedFileName = localStorage.getItem('nicelims_filename');
            const currentDataStr = JSON.stringify(data);
            
            if (savedData !== currentDataStr || savedFileName !== fileName) {
                setHasUnsavedChanges(true);
            } else {
                setHasUnsavedChanges(false);
            }
        }
    }, [data, fileName, autoSave, isInitialized]);

    // Handle auto-save toggle
    const toggleAutoSave = () => {
        const newValue = !autoSave;
        setAutoSave(newValue);
        localStorage.setItem('nicelims_autosave', String(newValue));
        if (newValue) {
            // Immediately save current state if turned on
            localStorage.setItem('nicelims_data', JSON.stringify(data));
            localStorage.setItem('nicelims_filename', fileName);
            setHasUnsavedChanges(false);
        }
    };

    // Manual save
    const handleManualSave = () => {
        localStorage.setItem('nicelims_data', JSON.stringify(data));
        localStorage.setItem('nicelims_filename', fileName);
        setHasUnsavedChanges(false);
    };

    // Theme Logic
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    // Handle window resize to auto-collapse on mobile initially
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                // On mobile, default to hidden
                setSidebarOpen(false);
            } else {
                // On desktop, default to open
                setSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();
    }, []);

    // Import JSON
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Update filename based on imported file (stripping extension)
            const name = file.name.replace(/\.json$/i, "");
            setFileName(name);

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    // Basic validation could go here
                    setData(json);
                    console.log("Imported successfully");
                } catch (error) {
                    console.error("Error parsing JSON", error);
                }
            };
            reader.readAsText(file);
        }
    };

    // Export JSON
    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${fileName}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // New File Logic
    const handleNewFile = () => {
        setData(DEFAULT_DATA);
        setFileName("data_lims");
        setCurrentView('DASHBOARD');
        setSelectedLabIndex(null);
        setNavTarget(null);
        setIsNewFileModalOpen(false);
    };

    // Rename Logic
    const openRenameModal = () => {
        setTempFileName(fileName);
        setIsRenameModalOpen(true);
    };

    const saveFileName = () => {
        if (tempFileName.trim()) {
            setFileName(tempFileName.trim());
            setIsRenameModalOpen(false);
        }
    };

    // Navigation Logic
    const navigateTo = (view: ViewType) => {
        setCurrentView(view);
        setSelectedLabIndex(null);
        setNavTarget(null); // Clear specific targets when navigating via menu
        // On mobile, auto close sidebar after navigation
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    // Deep Navigation Handlers
    const handleNavigateToEquipment = (labIndex: number, equipmentIndex: number) => {
        setSelectedLabIndex(labIndex);
        setNavTarget({ equipmentIndex });
        setCurrentView('LAB_DETAIL');
    };

    const handleNavigateToSoftware = (labIndex: number, softwareIndex: number) => {
        setSelectedLabIndex(labIndex);
        setNavTarget({ softwareIndex });
        setCurrentView('LAB_DETAIL');
    };

    // CRUD Operations
    const handleAddLab = () => {
        const newLab: Lab = {
            infoAmbiente: {
                "NUMERO DE LABORATORIO O TALLER": "NEW",
                "CÓDIGO DE LABORATORIO O TALLER": `LA${(data.labs || []).length + 1}`,
                "NOMBRE DEL LABORATORIO O TALLER": "Nuevo Laboratorio",
                "TIPO DE LABORATORIO O TALLER": "Enseñanza",
                "CODIGO PATRIMONIO AMBIENTE": "",
                "REFERENCIA DE UBICACIÓN": "",
                "PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER": [],
                "CANTIDAD DE PROGRAMA(S) QUE UTILIZAN EL LABORATORIO O TALLER": "0",
                "SERVICIO DE INTERNET (SI/NO)": "Sí",
                "ÁREA (m2)": "0",
                "AFORO": "0",
                "COMENTARIOS": "",
                "RESPONSABLE DEL LABORATORIO O TALLER": { "NOMBRE": "", "NUMERO DE CONTACTO": "" },
                "PERSONAL TÉCNICO": [],
                "PERSONAL ASIGNADO PARA VERIFICAR LA CBC III": { "NOMBRE": "", "NUMERO DE CONTACTO": "" }
            },
            equipos: [],
            software: []
        };
        setData(prev => ({ ...prev, labs: [...(prev.labs || []), newLab] }));
        setSelectedLabIndex((data.labs || []).length);
        setCurrentView('LAB_DETAIL');
        setNavTarget(null);
    };

    const handleDuplicateLab = (index: number) => {
        const labToCopy = (data.labs || [])[index];
        if (labToCopy) {
            const newLab = JSON.parse(JSON.stringify(labToCopy));
            if (newLab.infoAmbiente) {
                newLab.infoAmbiente["NOMBRE DEL LABORATORIO O TALLER"] = `${newLab.infoAmbiente["NOMBRE DEL LABORATORIO O TALLER"]} (Copia)`;
                newLab.infoAmbiente["CÓDIGO DE LABORATORIO O TALLER"] = `${newLab.infoAmbiente["CÓDIGO DE LABORATORIO O TALLER"]}-CP`;
            }
            const newLabs = [...(data.labs || [])];
            newLabs.splice(index + 1, 0, newLab);
            setData(prev => ({ ...prev, labs: newLabs }));
        }
    };

    const confirmDeleteLab = (index: number) => {
        setLabToDelete(index);
        setIsDeleteModalOpen(true);
    };

    const executeDeleteLab = () => {
        if (labToDelete !== null) {
            setData(prev => ({
                ...prev,
                labs: (prev.labs || []).filter((_, i) => i !== labToDelete)
            }));
            setLabToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    const handleUpdateLab = (updatedLab: Lab) => {
        if (selectedLabIndex !== null) {
            const newLabs = [...(data.labs || [])];
            newLabs[selectedLabIndex] = updatedLab;
            setData(prev => ({ ...prev, labs: newLabs }));
        }
    };

    const handleMoveEquipment = (targetLabIndex: number, equipmentIndex: number, unitIndices?: number[]) => {
        if (selectedLabIndex === null) return;

        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const sourceLab = newData.labs[selectedLabIndex];
            const targetLab = newData.labs[targetLabIndex];

            if (!sourceLab || !targetLab || !sourceLab.equipos[equipmentIndex]) return prev;

            const sourceEquipment = sourceLab.equipos[equipmentIndex];
            let unitsToMove: any[] = [];

            // 1. Determine which units to move and update the source lab
            if (!unitIndices || unitIndices.length === 0) {
                // CASE: Move ALL units (The entire equipment entry)
                unitsToMove = sourceEquipment.HojasDeVidaEquipos || [];
                // Remove the equipment entry from source completely
                sourceLab.equipos.splice(equipmentIndex, 1);
            } else {
                // CASE: Move PARTIAL units
                unitsToMove = (sourceEquipment.HojasDeVidaEquipos || []).filter((_: any, i: number) => unitIndices.includes(i));
                const unitsToKeep = (sourceEquipment.HojasDeVidaEquipos || []).filter((_: any, i: number) => !unitIndices.includes(i));

                // Update source equipment to only keep the remaining units
                sourceEquipment.HojasDeVidaEquipos = unitsToKeep;
                sourceEquipment["Nº DE EQUIPOS"] = unitsToKeep.length.toString();
            }

            // 2. Add to Target Lab
            if (!targetLab.equipos) targetLab.equipos = [];

            // Check if an equipment with the same Name, Brand, and Model exists in the target
            const sourceName = (sourceEquipment["NOMBRE DEL EQUIPO"] || "").trim().toUpperCase();
            const sourceBrand = (sourceEquipment.infoEquipo?.Marca || "").trim().toUpperCase();
            const sourceModel = (sourceEquipment.infoEquipo?.Modelo || "").trim().toUpperCase();

            const matchingTargetIndex = targetLab.equipos.findIndex((targetEq: any) => {
                const tName = (targetEq["NOMBRE DEL EQUIPO"] || "").trim().toUpperCase();
                const tBrand = (targetEq.infoEquipo?.Marca || "").trim().toUpperCase();
                const tModel = (targetEq.infoEquipo?.Modelo || "").trim().toUpperCase();
                return tName === sourceName && tBrand === sourceBrand && tModel === sourceModel;
            });

            if (matchingTargetIndex !== -1) {
                // MATCH FOUND: Merge units into existing equipment
                const targetEq = targetLab.equipos[matchingTargetIndex];
                targetEq.HojasDeVidaEquipos = [...(targetEq.HojasDeVidaEquipos || []), ...unitsToMove];
                // Update count
                targetEq["Nº DE EQUIPOS"] = targetEq.HojasDeVidaEquipos.length.toString();
            } else {
                // NO MATCH: Create new equipment entry
                // We clone the source equipment structure (metadata), but ensure we set the correct units
                const newEquipmentEntry = JSON.parse(JSON.stringify(sourceEquipment));
                newEquipmentEntry.HojasDeVidaEquipos = unitsToMove;
                newEquipmentEntry["Nº DE EQUIPOS"] = unitsToMove.length.toString();

                targetLab.equipos.push(newEquipmentEntry);
            }

            return newData;
        });
    };

    const handleMoveSoftware = (targetLabIndex: number, softwareIndex: number) => {
        if (selectedLabIndex === null) return;

        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const sourceLab = newData.labs[selectedLabIndex];
            const targetLab = newData.labs[targetLabIndex];

            if (!sourceLab || !targetLab || !sourceLab.software[softwareIndex]) return prev;

            const software = sourceLab.software[softwareIndex];

            sourceLab.software.splice(softwareIndex, 1);

            if (!targetLab.software) targetLab.software = [];
            targetLab.software.push(software);

            return newData;
        });
    };

    const handleUpdateSettings = (newData: UniversityData) => {
        setData(newData);
    };

    const handleCopyEquipmentData = (sourceEquipment: Equipo, targets: { labIndex: number, equipmentIndex: number }[], options: { fichaTecnica: boolean, procedimientos: boolean }) => {
        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            targets.forEach(target => {
                const targetLab = newData.labs[target.labIndex];
                if (!targetLab) return;
                const targetEq = targetLab.equipos[target.equipmentIndex];
                if (!targetEq) return;

                if (options.fichaTecnica) {
                    // Copy General Info (Ficha Técnica)
                    // We preserve the number of units as it's specific to the target
                    const currentQty = targetEq["Nº DE EQUIPOS"];
                    const currentUnits = targetEq.HojasDeVidaEquipos;

                    targetEq["NOMBRE DEL EQUIPO"] = sourceEquipment["NOMBRE DEL EQUIPO"];
                    if (sourceEquipment.infoEquipo) targetEq.infoEquipo = JSON.parse(JSON.stringify(sourceEquipment.infoEquipo));
                    if (sourceEquipment.caracteristicas) targetEq.caracteristicas = JSON.parse(JSON.stringify(sourceEquipment.caracteristicas));
                    if (sourceEquipment.Fotografias) targetEq.Fotografias = JSON.parse(JSON.stringify(sourceEquipment.Fotografias));
                    if (sourceEquipment.documentos) targetEq.documentos = JSON.parse(JSON.stringify(sourceEquipment.documentos));
                    targetEq.COMENTARIOS = sourceEquipment.COMENTARIOS;

                    // Restore target-specific fields
                    targetEq["Nº DE EQUIPOS"] = currentQty;
                    targetEq.HojasDeVidaEquipos = currentUnits;
                }

                if (options.procedimientos) {
                    // Copy Maintenance Procedures
                    if (sourceEquipment.ProcedimientoMantenimiento) {
                        targetEq.ProcedimientoMantenimiento = JSON.parse(JSON.stringify(sourceEquipment.ProcedimientoMantenimiento));
                    }
                }
            });
            return newData;
        });
    };


    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans">

            {/* Mobile Backdrop for Sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-50 h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300
            ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-64 md:w-20'}
        `}
            >
                {/* Clickable Header for Toggle */}
                <div
                    className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center h-16 shrink-0 overflow-hidden cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title="Mostrar/Ocultar Barra Lateral"
                >
                    <div className={`transition-all duration-300 flex items-center ${sidebarOpen ? 'gap-2' : ''}`}>
                        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                            N
                        </div>
                        <div className={`text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 overflow-hidden whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                            NiceLIMS
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                    <SidebarButton
                        active={currentView === 'DASHBOARD'}
                        onClick={() => navigateTo('DASHBOARD')}
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarButton
                        active={currentView === 'LABS_LIST' || currentView === 'LAB_DETAIL'}
                        onClick={() => navigateTo('LABS_LIST')}
                        icon={<FlaskConical size={20} />}
                        label="Laboratorios"
                        sidebarOpen={sidebarOpen}
                    />

                    <SidebarSectionTitle label="Mantenimiento" sidebarOpen={sidebarOpen} />

                    <SidebarButton
                        active={currentView === 'MAINTENANCE_PLAN'}
                        onClick={() => navigateTo('MAINTENANCE_PLAN')}
                        icon={<CalendarRange size={20} />}
                        label="Planificación"
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarButton
                        active={currentView === 'MAINTENANCE_LOGS'}
                        onClick={() => navigateTo('MAINTENANCE_LOGS')}
                        icon={<ClipboardCheck size={20} />}
                        label="Actividades (Logs)"
                        sidebarOpen={sidebarOpen}
                    />

                    <SidebarSectionTitle label="Inventario Global" sidebarOpen={sidebarOpen} />

                    <SidebarButton
                        active={currentView === 'ALL_EQUIPMENT'}
                        onClick={() => navigateTo('ALL_EQUIPMENT')}
                        icon={<Cpu size={20} />}
                        label="Equipos Globales"
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarButton
                        active={currentView === 'ALL_SOFTWARE'}
                        onClick={() => navigateTo('ALL_SOFTWARE')}
                        icon={<Save size={20} />}
                        label="Software Global"
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarButton
                        active={currentView === 'ALL_PERSONNEL'}
                        onClick={() => navigateTo('ALL_PERSONNEL')}
                        icon={<Users size={20} />}
                        label="Personal Global"
                        sidebarOpen={sidebarOpen}
                    />

                    <SidebarSectionTitle label="Sistema" sidebarOpen={sidebarOpen} />

                    <SidebarButton
                        active={currentView === 'SETTINGS'}
                        onClick={() => navigateTo('SETTINGS')}
                        icon={<Settings size={20} />}
                        label="Configuración"
                        sidebarOpen={sidebarOpen}
                    />
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden h-16 flex items-center">
                    <div className={`transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                        <div className="text-xs text-zinc-500 whitespace-nowrap">
                            <p className="font-semibold truncate max-w-[12rem]">{data["ABREVIATURA UNIVERSIDAD"] || "UNSA"}</p>
                            <p className="truncate max-w-[12rem]">{data["PROGRAMA DE ESTUDIOS"] || "SISTEMA"}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                <MenuBar
                    fileName={fileName}
                    onRename={openRenameModal}
                    onImport={handleImport}
                    onExport={handleExport}
                    theme={theme}
                    setTheme={setTheme}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                    onNavigate={navigateTo}
                    onAddLab={handleAddLab}
                    onShowAbout={() => setIsAboutModalOpen(true)}
                    onNewFile={() => setIsNewFileModalOpen(true)}
                    autoSave={autoSave}
                    toggleAutoSave={toggleAutoSave}
                    hasUnsavedChanges={hasUnsavedChanges}
                    onManualSave={handleManualSave}
                />

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {currentView === 'DASHBOARD' && (
                            <Dashboard data={data} />
                        )}

                        {currentView === 'LABS_LIST' && (
                            <LabList
                                labs={data.labs || []}
                                onSelectLab={(idx) => {
                                    setSelectedLabIndex(idx);
                                    setCurrentView('LAB_DETAIL');
                                }}
                                onDeleteLab={confirmDeleteLab}
                                onDuplicateLab={handleDuplicateLab}
                                onAddLab={handleAddLab}
                            />
                        )}

                        {currentView === 'LAB_DETAIL' && selectedLabIndex !== null && (data.labs || [])[selectedLabIndex] && (
                            <LabDetail
                                lab={(data.labs || [])[selectedLabIndex]}
                                allLabs={data.labs || []}
                                currentLabIndex={selectedLabIndex}
                                onBack={() => {
                                    setCurrentView('LABS_LIST');
                                    setNavTarget(null);
                                }}
                                onUpdate={handleUpdateLab}
                                onMoveEquipment={handleMoveEquipment}
                                onMoveSoftware={handleMoveSoftware}
                                onCopyEquipmentData={handleCopyEquipmentData}
                                initialEquipmentIndex={navTarget?.equipmentIndex}
                                initialSoftwareIndex={navTarget?.softwareIndex}
                            />
                        )}

                        {currentView === 'MAINTENANCE_PLAN' && (
                            <MaintenancePlan labs={data.labs || []} />
                        )}

                        {currentView === 'MAINTENANCE_LOGS' && (
                            <MaintenanceLogs labs={data.labs || []} />
                        )}

                        {currentView === 'ALL_EQUIPMENT' && (
                            <GlobalEquipmentList
                                labs={data.labs || []}
                                onNavigateToItem={handleNavigateToEquipment}
                            />
                        )}

                        {currentView === 'ALL_SOFTWARE' && (
                            <GlobalSoftwareList
                                labs={data.labs || []}
                                onNavigateToItem={handleNavigateToSoftware}
                            />
                        )}

                        {currentView === 'ALL_PERSONNEL' && (
                            <GlobalPersonnelList data={data} />
                        )}

                        {currentView === 'SETTINGS' && (
                            <SettingsView
                                data={data}
                                onUpdate={handleUpdateSettings}
                            />
                        )}
                    </div>
                </main>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Eliminar Laboratorio"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={executeDeleteLab}>Eliminar</Button>
                    </>
                }
            >
                <p>¿Estás seguro de que deseas eliminar este laboratorio? Esta acción no se puede deshacer.</p>
            </Modal>

            <Modal
                isOpen={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                title="Renombrar Archivo"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsRenameModalOpen(false)}>Cancelar</Button>
                        <Button onClick={saveFileName}>Guardar Nombre</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-zinc-500">Ingrese el nuevo nombre para el archivo (sin extensión):</p>
                    <Input
                        value={tempFileName}
                        onChange={(e) => setTempFileName(e.target.value)}
                        placeholder="Nombre del archivo"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveFileName();
                        }}
                    />
                </div>
            </Modal>

            <Modal
                isOpen={isNewFileModalOpen}
                onClose={() => setIsNewFileModalOpen(false)}
                title="Nuevo Archivo"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsNewFileModalOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={handleNewFile}>Crear Nuevo Archivo</Button>
                    </>
                }
            >
                <p>¿Estás seguro de que deseas crear un nuevo archivo? Se perderán todos los cambios no exportados.</p>
            </Modal>

            <Modal
                isOpen={isAboutModalOpen}
                onClose={() => setIsAboutModalOpen(false)}
                title="Acerca de NiceLIMS"
                footer={
                    <Button variant="primary" onClick={() => setIsAboutModalOpen(false)}>Entendido</Button>
                }
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white text-2xl font-bold">N</div>
                    <div>
                        <h4 className="font-bold text-lg">NiceLIMS v1.0.0</h4>
                        <p className="text-sm text-zinc-500">Sistema de Gestión de Laboratorios</p>
                    </div>
                    <p className="text-sm">
                        Aplicación minimalista para la gestión, inventario y mantenimiento de laboratorios universitarios.
                        Diseñado para ser rápido, eficiente y fácil de usar.
                    </p>
                    <div className="pt-2 text-xs text-zinc-400">
                        &copy; {new Date().getFullYear()} NiceLIMS. Todos los derechos reservados.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Helper Components for Sidebar
const SidebarButton = ({ active, onClick, icon, label, sidebarOpen }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, sidebarOpen: boolean }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center w-full px-3 py-2 rounded-md transition-all duration-200 group relative
            ${active ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}
            ${!sidebarOpen ? 'justify-center' : ''}
        `}
        title={!sidebarOpen ? label : undefined}
    >
        <span className="shrink-0">{icon}</span>

        <span className={`
        whitespace-nowrap overflow-hidden transition-all duration-300 origin-left
            ${sidebarOpen ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0 ml-0'}
            `}>
            {label}
        </span>

        {/* Tooltip for collapsed mode (desktop) */}
        {!sidebarOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap hidden md:block">
                {label}
            </div>
        )}
    </button>
);

const SidebarSectionTitle = ({ label, sidebarOpen }: { label: string, sidebarOpen: boolean }) => (
    <div className={`
    pt-4 pb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 transition-all duration-300 overflow-hidden whitespace-nowrap
    ${sidebarOpen ? 'opacity-100' : 'opacity-0 h-0 pt-0 pb-0'}
    `}>
        {label}
    </div>
);

export default App;