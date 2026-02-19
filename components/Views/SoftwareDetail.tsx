import React, { useState } from 'react';
import { Software, Documento } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { ImageViewer } from '../ui/ImageViewer';
import { ArrowLeft, Plus, Trash2, Save, HardDrive, Image as ImageIcon, FileText, ExternalLink } from 'lucide-react';

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

          {/* Photos and Documents */}
          <div className="space-y-6">
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon size={18}/> Capturas / Evidencia</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {(formData.Fotografias || []).map((photo, idx) => (
                            <div key={idx} className="relative group aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-zoom-in" onClick={() => setZoomedImage(photo)}>
                                {photo ? <img src={photo} alt="Software" className="w-full h-full object-cover transition-transform hover:scale-105" /> : <div className="flex items-center justify-center h-full text-zinc-400">Sin Imagen</div>}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="icon" 
                                        action="danger"
                                        size="icon-sm"
                                        className="bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removePhoto(idx);
                                        }}
                                    >
                                        <Trash2 size={12}/>
                                    </Button>
                                </div>
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

             {/* Document Section */}
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2"><FileText size={18}/> Documentación</CardTitle>
                        <Button size="sm" variant="secondary" onClick={addDocument}><Plus size={14}/></Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {(formData.documentos || []).map((doc, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                            <div className="flex-1 space-y-1">
                                <Input 
                                    placeholder="Título (ej. Factura)" 
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
                    {(formData.documentos || []).length === 0 && <p className="text-zinc-500 text-sm italic">No hay documentos registrados.</p>}
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