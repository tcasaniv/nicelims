import React from 'react';
import { Lab } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChevronRight, Trash2, Edit, Copy } from 'lucide-react';

interface LabListProps {
  labs: Lab[];
  onSelectLab: (index: number) => void;
  onDeleteLab: (index: number) => void;
  onDuplicateLab: (index: number) => void;
  onAddLab: () => void;
}

export const LabList: React.FC<LabListProps> = ({ labs = [], onSelectLab, onDeleteLab, onDuplicateLab, onAddLab }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Laboratorios</h2>
        <Button onClick={onAddLab}>+ Nuevo Laboratorio</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {labs.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            No hay laboratorios registrados. Importa un JSON o crea uno nuevo.
          </div>
        ) : (
          labs.map((lab, index) => (
            <Card key={index} className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onSelectLab(index)}>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 text-xs rounded font-mono">
                      {lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C"}
                    </span>
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Laboratorio sin nombre"}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {lab.infoAmbiente?.["REFERENCIA DE UBICACIÓN"] || "Sin ubicación"}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                    <span>Equipos: {lab.equipos?.length || 0}</span>
                    <span>Software: {lab.software?.length || 0}</span>
                    <span>Aforo: {lab.infoAmbiente?.AFORO || "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <Button variant="icon" action="primary" onClick={() => onDuplicateLab(index)} title="Duplicar">
                    <Copy size={18} />
                  </Button>
                  <Button variant="icon" action="primary" onClick={() => onSelectLab(index)} title="Editar">
                    <Edit size={18} />
                  </Button>
                  <Button variant="icon" action="danger" onClick={() => onDeleteLab(index)} title="Eliminar">
                    <Trash2 size={18} />
                  </Button>
                  <Button variant="icon" onClick={() => onSelectLab(index)}>
                    <ChevronRight size={20} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};