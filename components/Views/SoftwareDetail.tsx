import React, { useState } from 'react';
import { Software } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { ImageViewer } from '../ui/ImageViewer';
import { ArrowLeft, Plus, Trash2, Save, HardDrive, Image as ImageIcon } from 'lucide-react';

interface SoftwareDetailProps {
  software: Software;
  onUpdate: (sw: Software) => void;
  onBack: () => void;
}

export const SoftwareDetail: React.FC<SoftwareDetailProps> = ({ software, onUpdate, onBack }) => {
  const [formData, setFormData] = useState<Software>(software);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const saveChanges = () => {
    onUpdate(formData);
  };

  const handleAddPhoto = () => {
      if (newPhotoUrl.trim()) {
          setFormData(prev => ({ ...prev, Fotografias: [...(prev.Fotografias || []), newPhotoUrl.trim()] }));
          setNewPhotoUrl("");
          setIsPhotoModalOpen(false);
      }
  };

  const removePhoto = (idx: number) => {
      setFormData(prev => ({ 
          ...prev, 
          Fotografias: (prev.Fotografias || []).filter((_, i) => i !== idx) 
      }));
  };

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
              {formData["NOMBRE DEL SOFTWARE"] || "Software Sin Nombre"}
            </h2>
            <p className="text-sm text-zinc-500">
               v{formData["VERSIÓN"] || "?"} - {formData["TIPO DE LICENCIA"]}
            </p>
          </div>
        </div>
        <Button onClick={saveChanges} className="gap-2"> <Save size={16}/> Guardar Software</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          
          {/* General Info */}
          <div className="space-y-6">
              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><HardDrive size={18}/> Información de Licencia</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <Input 
                        label="Nombre del Software" 
                        value={formData["NOMBRE DEL SOFTWARE"]} 
                        onChange={e => setFormData({...formData, "NOMBRE DEL SOFTWARE": e.target.value})} 
                      />
                      <div className="grid grid-cols-2 gap-4">
                          <Input 
                            label="Versión" 
                            value={formData["VERSIÓN"]} 
                            onChange={e => setFormData({...formData, "VERSIÓN": e.target.value})} 
                          />
                          <Input 
                            label="Nº De Licencias" 
                            value={formData["Nº DE LICENCIAS"]} 
                            onChange={e => setFormData({...formData, "Nº DE LICENCIAS": e.target.value})} 
                          />
                      </div>
                      <Input 
                        label="Tipo de Licencia" 
                        value={formData["TIPO DE LICENCIA"]} 
                        onChange={e => setFormData({...formData, "TIPO DE LICENCIA": e.target.value})} 
                        placeholder="Ej. Perpetua, Anual, Open Source"
                      />
                      <Input 
                        textarea 
                        label="Comentarios / Detalles" 
                        value={formData["COMENTARIOS"]} 
                        onChange={e => setFormData({...formData, "COMENTARIOS": e.target.value})} 
                        rows={5}
                      />
                  </CardContent>
              </Card>
          </div>

          {/* Photos */}
          <div className="space-y-6">
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon size={18}/> Capturas / Evidencia</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {(formData.Fotografias || []).map((photo, idx) => (
                            <div key={idx} className="relative group aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-zoom-in" onClick={() => setZoomedImage(photo)}>
                                {photo ? <img src={photo} alt="Software" className="w-full h-full object-cover transition-transform hover:scale-105" /> : <div className="flex items-center justify-center h-full text-zinc-400">Sin Imagen</div>}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={12}/>
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => setIsPhotoModalOpen(true)}
                            className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400"
                        >
                            <Plus size={24}/>
                            <span className="text-xs mt-1">Añadir Imagen</span>
                        </button>
                    </div>
                </CardContent>
             </Card>
          </div>
      </div>

      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title="Añadir Imagen de Software"
        footer={
            <>
                <Button variant="ghost" onClick={() => setIsPhotoModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddPhoto}>Añadir</Button>
            </>
        }
      >
        <div className="space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Ingrese la URL de la captura de pantalla o licencia.</p>
            <Input 
                label="URL de la Imagen" 
                value={newPhotoUrl} 
                onChange={(e) => setNewPhotoUrl(e.target.value)} 
                placeholder="https://..." 
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