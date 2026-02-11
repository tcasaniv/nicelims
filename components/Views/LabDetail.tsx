import React, { useState } from 'react';
import { Lab, Equipo, Software, PersonalInfo } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { ImageViewer } from '../ui/ImageViewer';
import { ArrowLeft, Plus, Trash2, Save, Cpu, HardDrive, Users, UserCheck, UserCog, GraduationCap, Copy, ArrowRightLeft, Image as ImageIcon } from 'lucide-react';
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
}

type Tab = 'INFO' | 'EQUIPOS' | 'SOFTWARE';

export const LabDetail: React.FC<LabDetailProps> = ({ lab, allLabs, currentLabIndex, onBack, onUpdate, onMoveEquipment, onMoveSoftware }) => {
  const [activeTab, setActiveTab] = useState<Tab>('INFO');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Lab>(lab);
  
  // Navigation State
  const [selectedEquipmentIndex, setSelectedEquipmentIndex] = useState<number | null>(null);
  const [selectedSoftwareIndex, setSelectedSoftwareIndex] = useState<number | null>(null);

  // Photo Modals State
  const [labPhotoModalOpen, setLabPhotoModalOpen] = useState(false);
  const [newLabPhotoUrl, setNewLabPhotoUrl] = useState("");
  
  // Image Viewer State
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);


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
  React.useEffect(() => {
    setFormData(lab);
  }, [lab]);

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
    if(newLabPhotoUrl.trim()) {
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
    if(confirm("¿Eliminar este tipo de equipo y todo su historial?")) {
        const updatedEquipos = (formData.equipos || []).filter((_, i) => i !== idx);
        const newData = { ...formData, equipos: updatedEquipos };
        setFormData(newData);
        onUpdate(newData);
    }
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
    if(confirm("¿Eliminar este software?")) {
        const updatedSoftware = (formData.software || []).filter((_, i) => i !== idx);
        const newData = { ...formData, software: updatedSoftware };
        setFormData(newData);
        onUpdate(newData);
    }
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
             onUpdate={updateEquipment}
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
             <Button onClick={handleSave} className="gap-2"> <Save size={16}/> Guardar</Button>
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
                            <CardTitle className="flex items-center gap-2"><GraduationCap size={18}/> Programas que usan el ambiente</CardTitle>
                            {isEditing && <Button size="sm" variant="secondary" onClick={addProgram}><Plus size={14}/></Button>}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {getPrograms().map((prog, idx) => (
                            <div key={idx} className="flex gap-2">
                                <Input value={prog} onChange={(e) => updateProgram(idx, e.target.value)} disabled={!isEditing} placeholder="Código Programa (ej. P13)" />
                                {isEditing && <Button variant="ghost" className="text-red-500" onClick={() => removeProgram(idx)}><Trash2 size={16}/></Button>}
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
                    <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon size={18}/> Fotografías del Laboratorio</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {getLabPhotos().map((photo, idx) => (
                                <div key={idx} className="relative group aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-zoom-in" onClick={() => setZoomedImage(photo)}>
                                    <img src={photo} alt="Lab" className="w-full h-full object-cover transition-transform hover:scale-105" />
                                    {isEditing && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeLabPhoto(idx); }}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditing && (
                                <button 
                                    onClick={() => setLabPhotoModalOpen(true)}
                                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400"
                                >
                                    <Plus size={24}/>
                                    <span className="text-[10px] mt-1 text-center">Añadir</span>
                                </button>
                            )}
                        </div>
                         {getLabPhotos().length === 0 && !isEditing && <p className="text-sm text-zinc-500 italic">No hay fotografías.</p>}
                    </CardContent>
                 </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Users size={18}/> Responsables</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800">
                             <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><UserCheck size={16}/> Responsable del Laboratorio</h4>
                             <div className="space-y-2">
                                 <Input label="Nombre" value={getResponsible().NOMBRE} onChange={(e) => handlePersonalChange('RESPONSABLE DEL LABORATORIO O TALLER', 'NOMBRE', e.target.value)} disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                                 <Input label="Contacto" value={getResponsible()["NUMERO DE CONTACTO"]} onChange={(e) => handlePersonalChange('RESPONSABLE DEL LABORATORIO O TALLER', 'NUMERO DE CONTACTO', e.target.value)} disabled={!isEditing} className="bg-white dark:bg-zinc-900" />
                             </div>
                        </div>

                         <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md border border-purple-100 dark:border-purple-800">
                             <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2"><UserCog size={16}/> Verificación CBC III</h4>
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
                            <CardTitle className="flex items-center gap-2"><Users size={18}/> Personal Técnico</CardTitle>
                            {isEditing && <Button size="sm" variant="secondary" onClick={addTechStaff}><Plus size={14}/></Button>}
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
                                    <button 
                                        onClick={() => removeTechStaff(idx)}
                                        className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
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

        {activeTab === 'EQUIPOS' && (
          <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={addMockEquipment} size="sm"><Plus size={16} className="mr-2"/> Añadir Equipo</Button>
            </div>
            <div className="grid gap-4">
              {(formData.equipos || []).length === 0 && <div className="text-zinc-500 text-center py-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg">No hay equipos registrados.</div>}
              {(formData.equipos || []).map((eq, idx) => (
                <Card key={idx} className="cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors group">
                  <CardContent className="p-4" onClick={() => setSelectedEquipmentIndex(idx)}>
                     <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                           <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center shrink-0">
                               {eq.Fotografias?.[0] ? <img src={eq.Fotografias[0]} alt="eq" className="w-full h-full object-cover rounded"/> : <Cpu className="text-zinc-400"/>}
                           </div>
                           <div>
                               <h4 className="font-bold text-lg">{eq["NOMBRE DEL EQUIPO"] || "Equipo sin nombre"}</h4>
                               <p className="text-sm text-zinc-500">{eq.infoEquipo?.Marca} {eq.infoEquipo?.Modelo}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-50" onClick={(e) => openMoveModal(idx, e)} title="Mover Equipo">
                                <ArrowRightLeft size={16} />
                            </Button>
                             <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => duplicateEquipment(idx, e)} title="Duplicar">
                                <Copy size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => deleteEquipment(idx, e)} title="Eliminar">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                     </div>
                     <div className="mt-4 flex gap-4 text-xs text-zinc-500">
                         <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Cant: {eq["Nº DE EQUIPOS"] || "1"}</span>
                         <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Unidades Inventariadas: {(eq.HojasDeVidaEquipos || []).length}</span>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SOFTWARE' && (
          <div className="space-y-4">
             <div className="flex justify-end">
                <Button onClick={addMockSoftware} size="sm"><Plus size={16} className="mr-2"/> Añadir Software</Button>
            </div>
             <div className="grid gap-4">
              {(formData.software || []).length === 0 && <div className="text-zinc-500 text-center py-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg">No hay software registrado.</div>}
              {(formData.software || []).map((sw, idx) => (
                <Card key={idx} className="cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors group">
                  <CardContent className="p-4" onClick={() => setSelectedSoftwareIndex(idx)}>
                     <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center text-purple-600 dark:text-purple-300 overflow-hidden shrink-0">
                              {sw.Fotografias?.[0] ? <img src={sw.Fotografias[0]} alt="sw" className="w-full h-full object-cover"/> : <HardDrive size={24} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{sw["NOMBRE DEL SOFTWARE"] || "Software sin nombre"}</h4>
                            <div className="text-sm text-zinc-500 flex gap-3 mt-1">
                              <span>v{sw["VERSIÓN"] || "?"}</span>
                              <span>•</span>
                              <span>{sw["Nº DE LICENCIAS"] || "0"} Licencias</span>
                            </div>
                          </div>
                        </div>
                         <div className="flex gap-2">
                             <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-50" onClick={(e) => openMoveSoftwareModal(idx, e)} title="Mover Software">
                                <ArrowRightLeft size={16} />
                            </Button>
                             <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => duplicateSoftware(idx, e)} title="Duplicar">
                                <Copy size={16}/>
                             </Button>
                             <Button variant="ghost" size="sm" className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => deleteSoftware(idx, e)} title="Eliminar">
                                <Trash2 size={16} />
                             </Button>
                         </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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

      {/* Lab Photo Viewer */}
      <ImageViewer 
          isOpen={!!zoomedImage} 
          onClose={() => setZoomedImage(null)} 
          src={zoomedImage || ""} 
      />
    </div>
  );
};