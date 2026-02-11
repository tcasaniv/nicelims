import React, { useState } from 'react';
import { Lab, Equipo, Software } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { ArrowLeft, Plus, Trash2, Save, Cpu, HardDrive } from 'lucide-react';
import { EquipmentDetail } from './EquipmentDetail';

interface LabDetailProps {
  lab: Lab;
  onBack: () => void;
  onUpdate: (updatedLab: Lab) => void;
}

type Tab = 'INFO' | 'EQUIPOS' | 'SOFTWARE';

export const LabDetail: React.FC<LabDetailProps> = ({ lab, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('INFO');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Lab>(lab);
  
  // Navigation State
  const [selectedEquipmentIndex, setSelectedEquipmentIndex] = useState<number | null>(null);
  const [editingSoftwareIndex, setEditingSoftwareIndex] = useState<number | null>(null);
  const [softwareForm, setSoftwareForm] = useState<Software | null>(null);

  // --- GENERAL INFO LOGIC ---
  const handleChange = (section: keyof Lab['infoAmbiente'], value: string) => {
    setFormData(prev => ({
      ...prev,
      infoAmbiente: { ...(prev.infoAmbiente || {}), [section]: value }
    } as Lab));
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
    // Auto-select new equipment
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

  // --- SOFTWARE LOGIC ---
  const openSoftwareModal = (idx: number | null) => {
      if (idx !== null && formData.software) {
          setSoftwareForm({ ...formData.software[idx] });
          setEditingSoftwareIndex(idx);
      } else {
          setSoftwareForm({
              "Nº DE LICENCIAS": "1", "VERSIÓN": "", "NOMBRE DEL SOFTWARE": "", "TIPO DE LICENCIA": "", "COMENTARIOS": ""
          });
          setEditingSoftwareIndex(null); // New mode
      }
  };

  const saveSoftware = () => {
      if (!softwareForm) return;
      let newSoftwareList = [...(formData.software || [])];
      
      if (editingSoftwareIndex !== null) {
          newSoftwareList[editingSoftwareIndex] = softwareForm;
      } else {
          newSoftwareList.push(softwareForm);
      }
      
      const newData = { ...formData, software: newSoftwareList };
      setFormData(newData);
      onUpdate(newData);
      setSoftwareForm(null);
  };

  const deleteSoftware = (idx: number) => {
    if(confirm("¿Eliminar este software?")) {
        const updatedSoftware = (formData.software || []).filter((_, i) => i !== idx);
        const newData = { ...formData, software: updatedSoftware };
        setFormData(newData);
        onUpdate(newData);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="space-y-4 p-6">
                <Input label="Nombre del Laboratorio" value={getInfo("NOMBRE DEL LABORATORIO O TALLER")} onChange={(e) => handleChange("NOMBRE DEL LABORATORIO O TALLER", e.target.value)} disabled={!isEditing} />
                <Input label="Código" value={getInfo("CÓDIGO DE LABORATORIO O TALLER")} onChange={(e) => handleChange("CÓDIGO DE LABORATORIO O TALLER", e.target.value)} disabled={!isEditing} />
                <Input label="Referencia Ubicación" value={getInfo("REFERENCIA DE UBICACIÓN")} onChange={(e) => handleChange("REFERENCIA DE UBICACIÓN", e.target.value)} disabled={!isEditing} />
                <Input label="Tipo" value={getInfo("TIPO DE LABORATORIO O TALLER")} onChange={(e) => handleChange("TIPO DE LABORATORIO O TALLER", e.target.value)} disabled={!isEditing} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Aforo" value={getInfo("AFORO")} onChange={(e) => handleChange("AFORO", e.target.value)} disabled={!isEditing} />
                  <Input label="Área" value={getInfo("ÁREA (m2)")} onChange={(e) => handleChange("ÁREA (m2)", e.target.value)} disabled={!isEditing} />
                </div>
                 <Input label="Internet (Sí/No)" value={getInfo("SERVICIO DE INTERNET (SI/NO)")} onChange={(e) => handleChange("SERVICIO DE INTERNET (SI/NO)", e.target.value)} disabled={!isEditing} />
                <Input textarea label="Comentarios" value={getInfo("COMENTARIOS")} onChange={(e) => handleChange("COMENTARIOS", e.target.value)} disabled={!isEditing} rows={4} />
              </CardContent>
            </Card>
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
                        <Button variant="ghost" size="sm" className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => deleteEquipment(idx, e)}>
                            <Trash2 size={16} />
                        </Button>
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
                <Button onClick={() => openSoftwareModal(null)} size="sm"><Plus size={16} className="mr-2"/> Añadir Software</Button>
            </div>
             <div className="grid gap-4">
              {(formData.software || []).length === 0 && <div className="text-zinc-500 text-center py-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg">No hay software registrado.</div>}
              {(formData.software || []).map((sw, idx) => (
                <Card key={idx} className="group">
                  <CardContent className="p-4 flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center text-purple-600 dark:text-purple-300">
                          <HardDrive size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold">{sw["NOMBRE DEL SOFTWARE"] || "Software sin nombre"}</h4>
                        <div className="text-sm text-zinc-500 flex gap-3 mt-1">
                          <span>v{sw["VERSIÓN"] || "?"}</span>
                          <span>•</span>
                          <span>{sw["Nº DE LICENCIAS"] || "0"} Licencias</span>
                        </div>
                      </div>
                    </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="secondary" size="sm" onClick={() => openSoftwareModal(idx)}>Editar</Button>
                         <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteSoftware(idx)}><Trash2 size={16} /></Button>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Software Modal */}
      <Modal 
         isOpen={!!softwareForm} 
         onClose={() => setSoftwareForm(null)} 
         title={editingSoftwareIndex !== null ? "Editar Software" : "Nuevo Software"}
         footer={<>
            <Button variant="ghost" onClick={() => setSoftwareForm(null)}>Cancelar</Button>
            <Button onClick={saveSoftware}>Guardar</Button>
         </>}
      >
         {softwareForm && (
             <div className="space-y-4">
                 <Input label="Nombre del Software" value={softwareForm["NOMBRE DEL SOFTWARE"]} onChange={e => setSoftwareForm({...softwareForm, "NOMBRE DEL SOFTWARE": e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                     <Input label="Versión" value={softwareForm["VERSIÓN"]} onChange={e => setSoftwareForm({...softwareForm, "VERSIÓN": e.target.value})} />
                     <Input label="Nº Licencias" value={softwareForm["Nº DE LICENCIAS"]} onChange={e => setSoftwareForm({...softwareForm, "Nº DE LICENCIAS": e.target.value})} />
                 </div>
                 <Input label="Tipo de Licencia" value={softwareForm["TIPO DE LICENCIA"]} onChange={e => setSoftwareForm({...softwareForm, "TIPO DE LICENCIA": e.target.value})} />
                 <Input textarea label="Comentarios" value={softwareForm["COMENTARIOS"]} onChange={e => setSoftwareForm({...softwareForm, "COMENTARIOS": e.target.value})} />
             </div>
         )}
      </Modal>
    </div>
  );
};