import React, { useState } from 'react';
import { UniversityData, Director, Documento } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Save, Plus, Trash2, Eye, EyeOff, Link, Image, FileText, Users, School } from 'lucide-react';

interface SettingsProps {
  data: UniversityData;
  onUpdate: (newData: UniversityData) => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState<UniversityData>(data);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(data);

  const handleSave = () => {
    onUpdate(formData);
  };

  // Simple string getters/setters
  const getValue = (key: keyof UniversityData) => {
    const val = formData[key];
    return typeof val === 'string' ? val : '';
  };

  const handleChange = (key: keyof UniversityData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // --- PROGRAM DIRECTORS ---
  const getProgramDirectors = (): Director[] => {
    return Array.isArray(formData["DIRECTOR DEL PROGRAMA DE ESTUDIOS"])
      ? formData["DIRECTOR DEL PROGRAMA DE ESTUDIOS"]
      : [];
  };

  const updateProgramDirector = (index: number, updatedFields: Partial<Director>) => {
    const directors = [...getProgramDirectors()];
    directors[index] = { ...directors[index], ...updatedFields };
    setFormData(prev => ({ ...prev, "DIRECTOR DEL PROGRAMA DE ESTUDIOS": directors }));
  };

  const addProgramDirector = () => {
    const directors = [...getProgramDirectors()];
    directors.push({ visible: true, NOMBRE: '', Nombre: '', "NUMERO DE CONTACTO": '', CORREO: '', Periodo: '', Fotografias: [] });
    setFormData(prev => ({ ...prev, "DIRECTOR DEL PROGRAMA DE ESTUDIOS": directors }));
  };

  const removeProgramDirector = (index: number) => {
    const directors = getProgramDirectors().filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, "DIRECTOR DEL PROGRAMA DE ESTUDIOS": directors }));
  };

  // --- ACADEMIC DEPARTMENT ---
  const getDeptName = (): string => {
    const dept = formData["DEPARTAMENTO ACADÉMICO"];
    if (dept && typeof dept === 'object') return dept.NOMBRE || '';
    return typeof dept === 'string' ? dept : '';
  };

  const setDeptName = (name: string) => {
    setFormData(prev => {
      const dept = prev["DEPARTAMENTO ACADÉMICO"];
      const currentObj = dept && typeof dept === 'object' ? dept : { visible: true, NOMBRE: '' };
      return {
        ...prev,
        "DEPARTAMENTO ACADÉMICO": { ...currentObj, NOMBRE: name }
      };
    });
  };

  const getDeptVisible = (): boolean => {
    const dept = formData["DEPARTAMENTO ACADÉMICO"];
    if (dept && typeof dept === 'object') return dept.visible !== false;
    return true;
  };

  const setDeptVisible = (visible: boolean) => {
    setFormData(prev => {
      const dept = prev["DEPARTAMENTO ACADÉMICO"];
      const currentObj = dept && typeof dept === 'object' ? dept : { visible: true, NOMBRE: '' };
      return {
        ...prev,
        "DEPARTAMENTO ACADÉMICO": { ...currentObj, visible }
      };
    });
  };

  const getDeptDirectors = (): Director[] => {
    const dept = formData["DEPARTAMENTO ACADÉMICO"];
    if (dept && typeof dept === 'object' && Array.isArray(dept.Director)) return dept.Director;
    return [];
  };

  const updateDeptDirector = (index: number, updatedFields: Partial<Director>) => {
    const dept = formData["DEPARTAMENTO ACADÉMICO"];
    const currentObj = dept && typeof dept === 'object' ? dept : { visible: true, NOMBRE: '', Director: [] };
    const directors = [...(currentObj.Director || [])];
    directors[index] = { ...directors[index], ...updatedFields };
    setFormData(prev => ({
      ...prev,
      "DEPARTAMENTO ACADÉMICO": { ...currentObj, Director: directors }
    }));
  };

  const addDeptDirector = () => {
    const dept = formData["DEPARTAMENTO ACADÉMICO"];
    const currentObj = dept && typeof dept === 'object' ? dept : { visible: true, NOMBRE: '', Director: [] };
    const directors = [...(currentObj.Director || [])];
    directors.push({ visible: true, NOMBRE: '', Nombre: '', "NUMERO DE CONTACTO": '', CORREO: '', Periodo: '', Fotografias: [] });
    setFormData(prev => ({
      ...prev,
      "DEPARTAMENTO ACADÉMICO": { ...currentObj, Director: directors }
    }));
  };

  const removeDeptDirector = (index: number) => {
    const dept = formData["DEPARTAMENTO ACADÉMICO"];
    if (dept && typeof dept === 'object') {
      const directors = (dept.Director || []).filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        "DEPARTAMENTO ACADÉMICO": { ...dept, Director: directors }
      }));
    }
  };

  // --- GENERAL IMAGES (Fotografias) ---
  const getGeneralPhotos = (): string[] => {
    return Array.isArray(formData.Fotografias) ? formData.Fotografias : [];
  };

  const addGeneralPhoto = () => {
    const photos = [...getGeneralPhotos(), ''];
    setFormData(prev => ({ ...prev, Fotografias: photos }));
  };

  const updateGeneralPhoto = (index: number, value: string) => {
    const photos = [...getGeneralPhotos()];
    photos[index] = value;
    setFormData(prev => ({ ...prev, Fotografias: photos }));
  };

  const removeGeneralPhoto = (index: number) => {
    const photos = getGeneralPhotos().filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, Fotografias: photos }));
  };

  // --- GENERAL DOCUMENTS (documentos) ---
  const getGeneralDocs = (): Documento[] => {
    return Array.isArray(formData.documentos) ? formData.documentos : [];
  };

  const addGeneralDoc = () => {
    const docs = [...getGeneralDocs(), { titulo: '', url: '' }];
    setFormData(prev => ({ ...prev, documentos: docs }));
  };

  const updateGeneralDoc = (index: number, updatedFields: Partial<Documento>) => {
    const docs = [...getGeneralDocs()];
    docs[index] = { ...docs[index], ...updatedFields };
    setFormData(prev => ({ ...prev, documentos: docs }));
  };

  const removeGeneralDoc = (index: number) => {
    const docs = getGeneralDocs().filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, documentos: docs }));
  };

  // --- CONTACT ENLACES ---
  const getContactVisible = (): boolean => {
    return formData.contacto?.visible !== false;
  };

  const setContactVisible = (visible: boolean) => {
    const currentContacto = formData.contacto || { visible: true, enlaces: [] };
    setFormData(prev => ({
      ...prev,
      contacto: { ...currentContacto, visible }
    }));
  };

  const getContactEnlaces = (): Documento[] => {
    return Array.isArray(formData.contacto?.enlaces) ? formData.contacto.enlaces : [];
  };

  const addContactEnlace = () => {
    const currentContacto = formData.contacto || { visible: true, enlaces: [] };
    const enlaces = [...(currentContacto.enlaces || []), { titulo: '', url: '' }];
    setFormData(prev => ({
      ...prev,
      contacto: { ...currentContacto, enlaces }
    }));
  };

  const updateContactEnlace = (index: number, updatedFields: Partial<Documento>) => {
    const currentContacto = formData.contacto || { visible: true, enlaces: [] };
    const enlaces = [...(currentContacto.enlaces || [])];
    enlaces[index] = { ...enlaces[index], ...updatedFields };
    setFormData(prev => ({
      ...prev,
      contacto: { ...currentContacto, enlaces }
    }));
  };

  const removeContactEnlace = (index: number) => {
    const currentContacto = formData.contacto || { visible: true, enlaces: [] };
    const enlaces = (currentContacto.enlaces || []).filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      contacto: { ...currentContacto, enlaces }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Configuración del Sistema</h2>
          <p className="text-sm text-zinc-500">Información institucional, administrativa y datos globales del JSON.</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
          <Save size={16} /> Guardar Cambios
          {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-1" />}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* INSTITUTIONAL INFO */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <School className="w-5 h-5 text-orange-500" />
            <CardTitle>Información Institucional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de la Universidad"
                value={getValue("NOMBRE DE LA UNIVERSIDAD")}
                onChange={(e) => handleChange("NOMBRE DE LA UNIVERSIDAD", e.target.value)}
              />
              <Input
                label="Abreviatura Universidad"
                value={getValue("ABREVIATURA UNIVERSIDAD")}
                onChange={(e) => handleChange("ABREVIATURA UNIVERSIDAD", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Facultad"
                value={getValue("FACULTAD")}
                onChange={(e) => handleChange("FACULTAD", e.target.value)}
              />
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Departamento Académico</label>
                  <button
                    onClick={() => setDeptVisible(!getDeptVisible())}
                    className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    {getDeptVisible() ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{getDeptVisible() ? 'Visible' : 'Oculto'}</span>
                  </button>
                </div>
                <input
                  className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 text-sm"
                  value={getDeptName()}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Departamento Académico"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código Local"
                value={getValue("CODIGO LOCAL")}
                onChange={(e) => handleChange("CODIGO LOCAL", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* STUDY PROGRAM */}
        <Card>
          <CardHeader>
            <CardTitle>Programa de Estudios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Programa de Estudios"
                value={getValue("PROGRAMA DE ESTUDIOS")}
                onChange={(e) => handleChange("PROGRAMA DE ESTUDIOS", e.target.value)}
              />
              <Input
                label="Abreviatura Programa"
                value={getValue("ABREVIATURA PROGRAMA DE ESTUDIOS")}
                onChange={(e) => handleChange("ABREVIATURA PROGRAMA DE ESTUDIOS", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Escuela Profesional"
                value={getValue("ESCUELA")}
                onChange={(e) => handleChange("ESCUELA", e.target.value)}
              />
              <Input
                label="Código Programa"
                value={getValue("CODIGO PROGRAMA")}
                onChange={(e) => handleChange("CODIGO PROGRAMA", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* PROGRAM DIRECTORS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <CardTitle>Directores del Programa de Estudios</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={addProgramDirector} className="gap-1.5">
              <Plus size={14} /> Agregar Director
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {getProgramDirectors().length === 0 ? (
              <p className="text-sm text-zinc-500 italic text-center py-4">No hay directores registrados.</p>
            ) : (
              getProgramDirectors().map((dir, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50 space-y-4 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={() => updateProgramDirector(idx, { visible: dir.visible !== false ? false : true })}
                      className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      title={dir.visible !== false ? 'Hacer Oculto' : 'Hacer Visible'}
                    >
                      {dir.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => removeProgramDirector(idx)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar Director"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">Director #{idx + 1} {dir.visible === false && "(Oculto)"}</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre Completo"
                      value={dir.Nombre || dir.NOMBRE || ''}
                      onChange={(e) => updateProgramDirector(idx, { Nombre: e.target.value, NOMBRE: e.target.value })}
                    />
                    <Input
                      label="Periodo / Gestión"
                      value={dir.Periodo || ''}
                      onChange={(e) => updateProgramDirector(idx, { Periodo: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Número de Contacto"
                      value={dir["NUMERO DE CONTACTO"] || ''}
                      onChange={(e) => updateProgramDirector(idx, { "NUMERO DE CONTACTO": e.target.value })}
                    />
                    <Input
                      label="Correo Electrónico"
                      value={dir.CORREO || ''}
                      onChange={(e) => updateProgramDirector(idx, { CORREO: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">URLs de Fotografías (Separadas por comas)</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 text-sm"
                      value={Array.isArray(dir.Fotografias) ? dir.Fotografias.join(', ') : ''}
                      onChange={(e) => updateProgramDirector(idx, {
                        Fotografias: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* DEPARTMENT DIRECTORS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <CardTitle>Directores del Departamento Académico</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={addDeptDirector} className="gap-1.5">
              <Plus size={14} /> Agregar Director Dept.
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {getDeptDirectors().length === 0 ? (
              <p className="text-sm text-zinc-500 italic text-center py-4">No hay directores de departamento registrados.</p>
            ) : (
              getDeptDirectors().map((dir, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50 space-y-4 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={() => updateDeptDirector(idx, { visible: dir.visible !== false ? false : true })}
                      className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      title={dir.visible !== false ? 'Hacer Oculto' : 'Hacer Visible'}
                    >
                      {dir.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => removeDeptDirector(idx)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar Director"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">Director Dept. #{idx + 1} {dir.visible === false && "(Oculto)"}</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre Completo"
                      value={dir.Nombre || dir.NOMBRE || ''}
                      onChange={(e) => updateDeptDirector(idx, { Nombre: e.target.value, NOMBRE: e.target.value })}
                    />
                    <Input
                      label="Periodo / Gestión"
                      value={dir.Periodo || ''}
                      onChange={(e) => updateDeptDirector(idx, { Periodo: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Número de Contacto"
                      value={dir["NUMERO DE CONTACTO"] || ''}
                      onChange={(e) => updateDeptDirector(idx, { "NUMERO DE CONTACTO": e.target.value })}
                    />
                    <Input
                      label="Correo Electrónico"
                      value={dir.CORREO || ''}
                      onChange={(e) => updateDeptDirector(idx, { CORREO: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">URLs de Fotografías (Separadas por comas)</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700 text-sm"
                      value={Array.isArray(dir.Fotografias) ? dir.Fotografias.join(', ') : ''}
                      onChange={(e) => updateDeptDirector(idx, {
                        Fotografias: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* GENERAL PHOTOGRAPHS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-orange-500" />
              <CardTitle>Fotografías del Programa / Portada</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={addGeneralPhoto} className="gap-1.5">
              <Plus size={14} /> Agregar Foto
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {getGeneralPhotos().length === 0 ? (
              <p className="text-sm text-zinc-500 italic text-center py-4">No hay fotografías generales.</p>
            ) : (
              getGeneralPhotos().map((url, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-grow">
                    <Input
                      value={url}
                      onChange={(e) => updateGeneralPhoto(idx, e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  {url && (
                    <img src={url} alt={`Preview ${idx}`} className="w-10 h-10 object-cover rounded border" />
                  )}
                  <button
                    onClick={() => removeGeneralPhoto(idx)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* GENERAL DOCUMENTS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <CardTitle>Documentos Generales</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={addGeneralDoc} className="gap-1.5">
              <Plus size={14} /> Agregar Documento
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {getGeneralDocs().length === 0 ? (
              <p className="text-sm text-zinc-500 italic text-center py-4">No hay documentos registrados.</p>
            ) : (
              getGeneralDocs().map((doc, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-900/30 flex flex-col md:flex-row gap-4 items-end relative">
                  <button
                    onClick={() => removeGeneralDoc(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex-grow w-full md:w-1/2">
                    <Input
                      label="Título del Documento"
                      value={doc.titulo}
                      onChange={(e) => updateGeneralDoc(idx, { titulo: e.target.value })}
                      placeholder="e.g. Plan de Estudios 2026"
                    />
                  </div>
                  <div className="flex-grow w-full md:w-1/2">
                    <Input
                      label="URL del Documento / PDF"
                      value={doc.url}
                      onChange={(e) => updateGeneralDoc(idx, { url: e.target.value })}
                      placeholder="https://ejemplo.com/archivo.pdf"
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* CONTACT LINKS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-orange-500" />
              <CardTitle>Contacto y Enlaces</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setContactVisible(!getContactVisible())}
                className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                {getContactVisible() ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{getContactVisible() ? 'Visible' : 'Oculto'}</span>
              </button>
              <Button size="sm" variant="outline" onClick={addContactEnlace} className="gap-1.5">
                <Plus size={14} /> Agregar Enlace
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {getContactEnlaces().length === 0 ? (
              <p className="text-sm text-zinc-500 italic text-center py-4">No hay enlaces de contacto.</p>
            ) : (
              getContactEnlaces().map((link, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-900/30 flex flex-col md:flex-row gap-4 items-end relative">
                  <button
                    onClick={() => removeContactEnlace(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex-grow w-full md:w-1/2">
                    <Input
                      label="Título del Enlace"
                      value={link.titulo}
                      onChange={(e) => updateContactEnlace(idx, { titulo: e.target.value })}
                      placeholder="e.g. Matrícula Web"
                    />
                  </div>
                  <div className="flex-grow w-full md:w-1/2">
                    <Input
                      label="URL de Destino"
                      value={link.url}
                      onChange={(e) => updateContactEnlace(idx, { url: e.target.value })}
                      placeholder="https://matricula.universidad.edu.pe"
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};