import React, { useState, useEffect } from 'react';
import { UniversityData, ThemeMode, ViewType, Lab } from './types';
import { DEFAULT_DATA } from './constants';
import { MenuBar } from './components/Layout/MenuBar';
import { Dashboard } from './components/Views/Dashboard';
import { LabList } from './components/Views/LabList';
import { LabDetail } from './components/Views/LabDetail';
import { Settings as SettingsView } from './components/Views/Settings';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { LayoutDashboard, FlaskConical, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<UniversityData>(DEFAULT_DATA);
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [selectedLabIndex, setSelectedLabIndex] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [labToDelete, setLabToDelete] = useState<number | null>(null);

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

  // Handle window resize to auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Initial check
    if (window.innerWidth < 768) setSidebarOpen(false);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Import JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    downloadAnchorNode.setAttribute("download", "data_lims.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Navigation Logic
  const navigateTo = (view: ViewType) => {
    setCurrentView(view);
    setSelectedLabIndex(null);
    // On mobile, auto close sidebar after navigation
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
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
          // Deep clone to avoid mutation
          const newData = JSON.parse(JSON.stringify(prev));
          const sourceLab = newData.labs[selectedLabIndex];
          const targetLab = newData.labs[targetLabIndex];
          
          if (!sourceLab || !targetLab || !sourceLab.equipos[equipmentIndex]) return prev;

          const equipment = sourceLab.equipos[equipmentIndex];

          if (!unitIndices || unitIndices.length === 0) {
              // Move ENTIRE equipment
              // 1. Remove from source
              sourceLab.equipos.splice(equipmentIndex, 1);
              
              // 2. Add to target
              if (!targetLab.equipos) targetLab.equipos = [];
              targetLab.equipos.push(equipment);
          } else {
              // Move SPECIFIC units
              // 1. Create a copy of the equipment for target lab (initially with no units)
              const newEquipmentForTarget = JSON.parse(JSON.stringify(equipment));
              newEquipmentForTarget.HojasDeVidaEquipos = [];
              // Reset quantities mostly for clarity, though strict JSON structure might require keeping them
              newEquipmentForTarget["Nº DE EQUIPOS"] = unitIndices.length.toString(); 

              // 2. Separate units
              const unitsToMove = (equipment.HojasDeVidaEquipos || []).filter((_: any, i: number) => unitIndices.includes(i));
              const unitsToKeep = (equipment.HojasDeVidaEquipos || []).filter((_: any, i: number) => !unitIndices.includes(i));

              // 3. Update source equipment
              equipment.HojasDeVidaEquipos = unitsToKeep;
              equipment["Nº DE EQUIPOS"] = unitsToKeep.length.toString();

              // 4. Update target equipment
              newEquipmentForTarget.HojasDeVidaEquipos = unitsToMove;
              
              // 5. Add to target lab
              if (!targetLab.equipos) targetLab.equipos = [];
              targetLab.equipos.push(newEquipmentForTarget);
          }
          
          return newData;
      });
  };
  
  const handleUpdateSettings = (newData: UniversityData) => {
    setData(newData);
    // Optional: Add toast notification here
  };


  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden whitespace-nowrap`}>
         <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center min-w-[16rem]">
             <div className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">NiceLIMS</div>
         </div>
         <nav className="flex-1 p-4 space-y-1 min-w-[16rem]">
            <button 
                onClick={() => navigateTo('DASHBOARD')}
                className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${currentView === 'DASHBOARD' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
                <LayoutDashboard size={20} className="mr-3 shrink-0" />
                Dashboard
            </button>
            <button 
                onClick={() => navigateTo('LABS_LIST')}
                className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${currentView === 'LABS_LIST' || currentView === 'LAB_DETAIL' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
                <FlaskConical size={20} className="mr-3 shrink-0" />
                Laboratorios
            </button>
            <button 
                 onClick={() => navigateTo('SETTINGS')}
                 className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${currentView === 'SETTINGS' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
                <Settings size={20} className="mr-3 shrink-0" />
                Configuración
            </button>
         </nav>
         
         <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 min-w-[16rem]">
             <div className="text-xs text-zinc-500">
                 <p className="font-semibold">{data["ABREVIATURA UNIVERSIDAD"] || "UNSA"}</p>
                 <p className="truncate">{data["PROGRAMA DE ESTUDIOS"] || "SISTEMA"}</p>
             </div>
         </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <MenuBar 
          onImport={handleImport} 
          onExport={handleExport} 
          theme={theme} 
          setTheme={setTheme}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onNavigate={navigateTo}
          onAddLab={handleAddLab}
          onShowAbout={() => setIsAboutModalOpen(true)}
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
                        onBack={() => setCurrentView('LABS_LIST')}
                        onUpdate={handleUpdateLab}
                        onMoveEquipment={handleMoveEquipment}
                    />
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

export default App;