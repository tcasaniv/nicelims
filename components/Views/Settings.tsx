import React, { useState } from 'react';
import { UniversityData } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Save } from 'lucide-react';

interface SettingsProps {
  data: UniversityData;
  onUpdate: (newData: UniversityData) => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState<UniversityData>(data);

  const handleChange = (key: keyof UniversityData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onUpdate(formData);
    // Visual feedback could be added here
  };

  const getValue = (key: keyof UniversityData) => {
    const val = formData[key];
    if (typeof val === 'string') return val;
    return "";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Configuración del Sistema</h2>
          <p className="text-sm text-zinc-500">Información institucional y administrativa.</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save size={16} /> Guardar Cambios
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
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
                label="Abreviatura"
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
              <Input 
                label="Departamento Académico"
                value={getValue("DEPARTAMENTO ACADÉMICO")}
                onChange={(e) => handleChange("DEPARTAMENTO ACADÉMICO", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programa de Estudios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Programa / Escuela"
                value={getValue("PROGRAMA DE ESTUDIOS")}
                onChange={(e) => handleChange("PROGRAMA DE ESTUDIOS", e.target.value)}
              />
              <Input 
                label="Código Programa"
                value={getValue("CODIGO PROGRAMA")}
                onChange={(e) => handleChange("CODIGO PROGRAMA", e.target.value)}
              />
            </div>
             <Input 
                label="Escuela Profesional"
                value={getValue("ESCUELA")}
                onChange={(e) => handleChange("ESCUELA", e.target.value)}
              />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Autoridades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Director de Programa"
                value={getValue("DIRECTOR DEL PROGRAMA DE ESTUDIOS")}
                onChange={(e) => handleChange("DIRECTOR DEL PROGRAMA DE ESTUDIOS", e.target.value)}
              />
              <Input 
                label="Director de Departamento"
                value={getValue("DIRECTOR DEL DEPARTAMENTO ACADÉMICO")}
                onChange={(e) => handleChange("DIRECTOR DEL DEPARTAMENTO ACADÉMICO", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};