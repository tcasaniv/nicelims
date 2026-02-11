import React from 'react';
import { UniversityData } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Microscope, Cpu, Save, Users } from 'lucide-react';

interface DashboardProps {
  data: UniversityData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const labs = data.labs || [];
  const totalLabs = labs.length;

  // Calculate Unique Equipment Names (Types)
  const uniqueEquipmentNames = new Set<string>();
  labs.forEach(lab => {
    (lab.equipos || []).forEach(eq => {
      if (eq["NOMBRE DEL EQUIPO"]) {
        uniqueEquipmentNames.add(eq["NOMBRE DEL EQUIPO"].trim().toUpperCase());
      }
    });
  });
  const totalUniqueEquipments = uniqueEquipmentNames.size;

  // Calculate Unique Software Names (Types)
  const uniqueSoftwareNames = new Set<string>();
  labs.forEach(lab => {
    (lab.software || []).forEach(sw => {
      if (sw["NOMBRE DEL SOFTWARE"]) {
        uniqueSoftwareNames.add(sw["NOMBRE DEL SOFTWARE"].trim().toUpperCase());
      }
    });
  });
  const totalUniqueSoftware = uniqueSoftwareNames.size;

  const totalCapacity = labs.reduce((acc, lab) => acc + parseInt(lab.infoAmbiente?.AFORO || "0", 10), 0);

  // Data for charts
  const equipmentPerLab = labs.map(lab => ({
    name: lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C",
    count: lab.equipos?.length || 0,
    full_name: lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre"
  }));

  const labsByType = labs.reduce((acc, lab) => {
    const type = lab.infoAmbiente?.["TIPO DE LABORATORIO O TALLER"] || "Sin Especificar";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(labsByType).map(key => ({
    name: key,
    value: labsByType[key]
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Laboratorios" 
          value={totalLabs} 
          icon={<Microscope className="h-4 w-4 text-blue-600" />} 
        />
        <StatsCard 
          title="Tipos de Equipos" 
          value={totalUniqueEquipments} 
          subtitle="Nombres únicos globales"
          icon={<Cpu className="h-4 w-4 text-emerald-600" />} 
        />
        <StatsCard 
          title="Tipos de Software" 
          value={totalUniqueSoftware} 
          subtitle="Nombres únicos globales"
          icon={<Save className="h-4 w-4 text-purple-600" />} 
        />
        <StatsCard 
          title="Aforo Total" 
          value={totalCapacity} 
          icon={<Users className="h-4 w-4 text-orange-600" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Equipos por Laboratorio</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipmentPerLab}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--tw-bg-opacity)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Tipos de Laboratorio</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle?: string }) => (
  <Card>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
        {icon}
      </div>
    </CardContent>
  </Card>
);