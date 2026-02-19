import React, { useState, useMemo } from 'react';
import { Equipo, Caracteristica, ProcedimientoMantenimiento, MantenimientoFrecuencia, MantenimientoTask, HojaDeVidaEquipo, MantenimientoLog, Documento } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { ImageViewer } from '../ui/ImageViewer';
import { ArrowLeft, Plus, Trash2, Save, Wrench, ClipboardList, Box, History, FileText, Copy, Camera, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, X, ExternalLink } from 'lucide-react';

interface EquipmentDetailProps {
  equipment: Equipo;
  onUpdate: (eq: Equipo) => void;
  onBack: () => void;
}

type Tab = 'GENERAL' | 'PROCEDIMIENTOS' | 'HOJAS_VIDA';
type MaintenanceType = 'preventivo' | 'correctivo';

const FREQUENCIES = [
  'enCadaUso', 'semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual'
];

export const EquipmentDetail: React.FC<EquipmentDetailProps> = ({ equipment, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  const [formData, setFormData] = useState<Equipo>(equipment);

  // --- Helpers for Deep Updates ---
  const handleInfoChange = (key: keyof Equipo['infoEquipo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      infoEquipo: { ...prev.infoEquipo, [key]: value }
    } as Equipo));
  };

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
        <Button onClick={saveChanges} className="gap-2"> <Save size={16}/> Guardar Equipo</Button>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <TabButton active={activeTab === 'GENERAL'} onClick={() => setActiveTab('GENERAL')} icon={<Box size={16}/>}>Ficha Técnica</TabButton>
        <TabButton active={activeTab === 'PROCEDIMIENTOS'} onClick={() => setActiveTab('PROCEDIMIENTOS')} icon={<Wrench size={16}/>}>Procedimientos Mantenimiento</TabButton>
        <TabButton active={activeTab === 'HOJAS_VIDA'} onClick={() => setActiveTab('HOJAS_VIDA')} icon={<ClipboardList size={16}/>}>Hojas de Vida (Inventario)</TabButton>
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
    </div>
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
            <Input label="Nombre del Equipo" value={formData["NOMBRE DEL EQUIPO"]} onChange={e => setFormData({...formData, "NOMBRE DEL EQUIPO": e.target.value})} />
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
               <Input label="Nº Total de Equipos" value={formData["Nº DE EQUIPOS"]} onChange={e => setFormData({...formData, "Nº DE EQUIPOS": e.target.value})} />
            </div>
            <Input textarea label="Comentarios Generales" value={formData.COMENTARIOS} onChange={e => setFormData({...formData, COMENTARIOS: e.target.value})} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle>Características Técnicas</CardTitle>
                <Button size="sm" variant="secondary" onClick={addCharacteristic}><Plus size={14}/></Button>
             </div>
          </CardHeader>
          <CardContent className="space-y-3">
             {(formData.caracteristicas || []).map((char, idx) => (
               <div key={idx} className="flex gap-2 items-start">
                 <Input placeholder="Característica (ej. Potencia)" value={char.Caracteristica} onChange={e => updateCharacteristic(idx, 'Caracteristica', e.target.value)} className="flex-1" />
                 <Input placeholder="Descripción (ej. 500W)" value={char.Descripcion} onChange={e => updateCharacteristic(idx, 'Descripcion', e.target.value)} className="flex-1" />
                 <Button variant="icon" action="danger" onClick={() => removeCharacteristic(idx)}><Trash2 size={16}/></Button>
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
                                        setFormData({...formData, Fotografias: newPhotos});
                                    }}
                                >
                                    <Trash2 size={12}/>
                                </Button>
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400"
                    >
                        <Plus size={24}/>
                        <span className="text-xs mt-1">Añadir Foto</span>
                    </button>
                </div>
            </CardContent>
         </Card>

         {/* Document Section */}
         <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><FileText size={18}/> Documentación Técnica</CardTitle>
                    <Button size="sm" variant="secondary" onClick={addDocument}><Plus size={14}/></Button>
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
                                <Trash2 size={16}/>
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
          if(!task.descripcion) task.descripcion = { title: "", Prioridad: 1, contenido: [] };
          task.descripcion.title = value;
      }
      if (field === 'responsable') task.responsable = value;
      if (field === 'cost') {
           if(!task["MONTO REF"]) task["MONTO REF"] = { currency: "S/.", amount: "0"};
           task["MONTO REF"].amount = value;
      }
      
      setFormData(newFormData);
  };
  
  // New step handlers
  const updateTaskStep = (taskIdx: number, stepIdx: number, value: string) => {
      const newFormData = JSON.parse(JSON.stringify(formData));
      const task = newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency][taskIdx];
      if(!task.descripcion) task.descripcion = { title: "", Prioridad: 1, contenido: [] };
      if(!task.descripcion.contenido) task.descripcion.contenido = [];
      task.descripcion.contenido[stepIdx] = value;
      setFormData(newFormData);
  };

  const addTaskStep = (taskIdx: number) => {
      const newFormData = JSON.parse(JSON.stringify(formData));
      const task = newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency][taskIdx];
      if(!task.descripcion) task.descripcion = { title: "", Prioridad: 1, contenido: [] };
      if(!task.descripcion.contenido) task.descripcion.contenido = [];
      task.descripcion.contenido.push("");
      setFormData(newFormData);
  };

  const removeTaskStep = (taskIdx: number, stepIdx: number) => {
      const newFormData = JSON.parse(JSON.stringify(formData));
      const task = newFormData.ProcedimientoMantenimiento.mantenimiento[maintType][frequency][taskIdx];
      if(task.descripcion?.contenido) {
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
                         <Button size="sm" onClick={addTask}><Plus size={14} className="mr-1"/> Agregar Tarea</Button>
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
                                        <Plus size={12} className="mr-1"/> Añadir paso
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
const LifeSheetsTab = ({ formData, setFormData }: { formData: Equipo, setFormData: React.Dispatch<React.SetStateAction<Equipo>> }) => {
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null);
  
  // Custom Confirmation Modal State
  const [confirmationState, setConfirmationState] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  // Table State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterLocation, setFilterLocation] = useState<string>("");

  const uniqueLocations = useMemo(() => {
      const locs = new Set<string>();
      (formData.HojasDeVidaEquipos || []).forEach(u => {
          if (u.infoEquipo?.Ubicación) locs.add(u.infoEquipo.Ubicación);
      });
      return Array.from(locs).sort();
  }, [formData.HojasDeVidaEquipos]);

  const getProcessedUnits = () => {
      let units = (formData.HojasDeVidaEquipos || []).map((u, i) => ({ ...u, originalIndex: i }));

      // Filter
      if (filterLocation) {
          units = units.filter(u => u.infoEquipo?.Ubicación === filterLocation);
      }

      // Search
      if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          units = units.filter(u => 
             u.infoEquipo?.["Codigo Inventario Equipo"]?.toLowerCase().includes(lower) ||
             u.infoEquipo?.Ubicación?.toLowerCase().includes(lower) ||
             u.nota?.toLowerCase().includes(lower)
          );
      }

      // Sort
      if (sortConfig) {
          units.sort((a, b) => {
              let valA = "";
              let valB = "";

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
                  return sortConfig.direction === 'asc' 
                    ? (a.mantenimientos || []).length - (b.mantenimientos || []).length 
                    : (b.mantenimientos || []).length - (a.mantenimientos || []).length;
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
  
  const clearFilters = () => {
      setSearchTerm("");
      setFilterLocation("");
      setSortConfig(null);
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
     const newUnit = JSON.parse(JSON.stringify(unit));
     if(newUnit.infoEquipo) {
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
             onUpdate={(u) => updateUnit(selectedUnitIndex, u)} 
             onBack={() => setSelectedUnitIndex(null)} 
          />
      );
  }

  const processedUnits = getProcessedUnits();
  const isReorderDisabled = !!searchTerm || !!filterLocation || !!sortConfig;

  return (
    <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <CardTitle>Inventario de Unidades</CardTitle>
                <Button onClick={addUnit}><Plus size={16} className="mr-2"/> Nueva Unidad</Button>
            </div>
            
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input 
                        placeholder="Buscar por código, ubicación..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative w-48">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                        <select 
                            className="w-full h-10 pl-9 pr-3 rounded-md border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                        >
                            <option value="">Todas las ubicaciones</option>
                            {uniqueLocations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    {(searchTerm || filterLocation || sortConfig) && (
                        <Button variant="ghost" onClick={clearFilters} title="Limpiar filtros" className="px-2">
                            <X size={16} />
                        </Button>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase">
                        <tr>
                            <th className="px-4 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('code')}>
                                <div className="flex items-center gap-2">Código <ArrowUpDown size={12}/></div>
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('location')}>
                                <div className="flex items-center gap-2">Ubicación <ArrowUpDown size={12}/></div>
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('date')}>
                                <div className="flex items-center gap-2">Adquisición <ArrowUpDown size={12}/></div>
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" onClick={() => requestSort('maint')}>
                                <div className="flex items-center gap-2">Mantenimientos <ArrowUpDown size={12}/></div>
                            </th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                        {processedUnits.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No se encontraron unidades.</td></tr>
                        )}
                        {processedUnits.map((item, idx) => (
                            <tr key={item.originalIndex} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer" onClick={() => setSelectedUnitIndex(item.originalIndex)}>
                                <td className="px-4 py-3 font-medium">{item.infoEquipo?.["Codigo Inventario Equipo"] || "Sin Código"}</td>
                                <td className="px-4 py-3">{item.infoEquipo?.Ubicación || "-"}</td>
                                <td className="px-4 py-3">{item.infoEquipo?.["FECHA DE ADQUISICIÓN"] || "-"}</td>
                                <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-100">{(item.mantenimientos || []).length} regs</span></td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end items-center gap-1">
                                        {!isReorderDisabled && (
                                            <div className="flex gap-1 mr-2">
                                                <Button variant="icon" action="primary" size="icon-md" onClick={(e) => { e.stopPropagation(); moveUnit(item.originalIndex, 'UP'); }} disabled={idx === 0}>
                                                    <ArrowUp size={14} />
                                                </Button>
                                                <Button variant="icon" action="primary" size="icon-md" onClick={(e) => { e.stopPropagation(); moveUnit(item.originalIndex, 'DOWN'); }} disabled={idx === processedUnits.length - 1}>
                                                    <ArrowDown size={14} />
                                                </Button>
                                            </div>
                                        )}
                                        <Button variant="icon" action="primary" onClick={(e) => { e.stopPropagation(); duplicateUnit(item.originalIndex); }} title="Duplicar">
                                            <Copy size={16}/>
                                        </Button>
                                        <Button variant="icon" action="danger" onClick={(e) => { e.stopPropagation(); deleteUnit(item.originalIndex); }} title="Eliminar">
                                            <Trash2 size={16}/>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isReorderDisabled && processedUnits.length > 0 && (
                <p className="text-xs text-zinc-400 mt-2 text-right">* El reordenamiento está desactivado mientras los filtros u ordenamiento estén activos.</p>
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
const UnitDetail = ({ unit, onUpdate, onBack }: { unit: HojaDeVidaEquipo, onUpdate: (u: HojaDeVidaEquipo) => void, onBack: () => void }) => {
    const [maintenancePhotoModal, setMaintenancePhotoModal] = useState<{ logIdx: number; isOpen: boolean } | null>(null);
    const [newMaintPhotoUrl, setNewMaintPhotoUrl] = useState("");
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    // Custom Confirmation Modal State
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

    const handleInfoChange = (key: string, value: string) => {
        onUpdate({ ...unit, infoEquipo: { ...(unit.infoEquipo || {}), [key]: value } as any });
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
        if(maintenancePhotoModal && newMaintPhotoUrl.trim()) {
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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                 <Button variant="ghost" onClick={onBack} size="sm"><ArrowLeft size={16}/> Volver al Inventario</Button>
                 <h3 className="font-bold text-lg">{unit.infoEquipo?.["Codigo Inventario Equipo"]}</h3>
            </div>

            <Card>
                <CardHeader><CardTitle>Datos de la Unidad</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Código Inventario" value={unit.infoEquipo?.["Codigo Inventario Equipo"]} onChange={e => handleInfoChange("Codigo Inventario Equipo", e.target.value)} />
                     <Input label="Ubicación Física" value={unit.infoEquipo?.Ubicación} onChange={e => handleInfoChange("Ubicación", e.target.value)} />
                     <Input label="Fecha Adquisición" type="date" value={unit.infoEquipo?.["FECHA DE ADQUISICIÓN"]} onChange={e => handleInfoChange("FECHA DE ADQUISICIÓN", e.target.value)} />
                     <Input label="Modo Adquisición" value={unit.infoEquipo?.["MODO DE ADQUISICIÓN"]} onChange={e => handleInfoChange("MODO DE ADQUISICIÓN", e.target.value)} />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                     <h3 className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><History size={18}/> Bitácora de Mantenimiento</h3>
                     <Button size="sm" onClick={addMaintenance}><Plus size={14} className="mr-1"/> Registrar Actividad</Button>
                </div>

                {(unit.mantenimientos || []).map((log, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-4 space-y-3 relative group">
                            <div className="relative top-2 right-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="icon" action="primary" size="sm" onClick={() => duplicateMaintenance(idx)} title="Duplicar entrada"><Copy size={14}/></Button>
                                <Button variant="icon" action="danger" size="sm" onClick={() => deleteMaintenance(idx)} title="Eliminar entrada"><Trash2 size={14}/></Button>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-xs text-zinc-400">Reg #{log.Nro}</span>
                                <Input type="date" value={log.Fecha} onChange={e => updateMaintenance(idx, {...log, Fecha: e.target.value})} className="w-auto text-xs py-1" />
                            </div>
                            <Input label="Actividad Realizada" value={log["Actividad realizada"]} onChange={e => updateMaintenance(idx, {...log, "Actividad realizada": e.target.value})} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Responsable" value={log.Responsable} onChange={e => updateMaintenance(idx, {...log, Responsable: e.target.value})} />
                                <Input label="Observaciones" value={log.Observaciones} onChange={e => updateMaintenance(idx, {...log, Observaciones: e.target.value})} />
                            </div>
                            
                            {/* Photos Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                     <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Evidencia Fotográfica</span>
                                     <Button size="sm" variant="secondary" onClick={() => openPhotoModal(idx)} className="h-6 px-2 text-xs"><Camera size={12} className="mr-1"/> Gestionar Fotos ({(log.Fotografias || []).length})</Button>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {(log.Fotografias || []).map((photo, photoIdx) => (
                                        <div key={photoIdx} className="w-16 h-16 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0 cursor-zoom-in" onClick={() => setZoomedImage(photo)}>
                                            <img src={photo} alt="evidencia" className="w-full h-full object-cover transition-transform hover:scale-110"/>
                                        </div>
                                    ))}
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
                         <Button onClick={addPhotoToLog} disabled={!newMaintPhotoUrl} size="sm"><Plus size={16}/></Button>
                     </div>
                     
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
                        {maintenancePhotoModal && (unit.mantenimientos || [])[maintenancePhotoModal.logIdx]?.Fotografias?.map((photo, pIdx) => (
                             <div key={pIdx} className="relative group aspect-square bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden cursor-zoom-in" onClick={() => setZoomedImage(photo)}>
                                 <img src={photo} alt="evidencia" className="w-full h-full object-cover transition-transform hover:scale-105"/>
                                 <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button variant="icon" action="danger" size="icon-sm" className="bg-white/80 hover:bg-white" onClick={(e) => { e.stopPropagation(); removePhotoFromLog(maintenancePhotoModal.logIdx, pIdx); }}>
                                        <Trash2 size={10}/>
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
        </div>
    );
};