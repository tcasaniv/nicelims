import React, { useRef, useState } from 'react';
import { Download, Upload, Moon, Sun, Monitor, Menu, PanelLeftClose, PanelLeftOpen, Plus, Info, Settings } from 'lucide-react';
import { ThemeMode, ViewType } from '../../types';
import { MenuDropdown, MenuItem } from '../ui/MenuDropdown';

interface MenuBarProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  onNavigate: (view: ViewType) => void;
  onAddLab: () => void;
  onShowAbout: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ 
  onImport, 
  onExport, 
  theme, 
  setTheme, 
  toggleSidebar, 
  sidebarOpen,
  onNavigate,
  onAddLab,
  onShowAbout
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Menu States
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const triggerImport = () => fileInputRef.current?.click();
  const closeMenu = () => setActiveMenu(null);
  const toggleMenu = (menu: string) => setActiveMenu(activeMenu === menu ? null : menu);

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-1 md:hidden rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
           <Menu size={20} className="text-zinc-600 dark:text-zinc-400" />
        </button>
        
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>N</div>
           <div>
             <h1 className="text-sm font-semibold text-zinc-800 dark:text-white leading-none cursor-pointer" onClick={() => onNavigate('DASHBOARD')}>NiceLIMS</h1>
             <div className="flex gap-1 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 relative">
               
               {/* Menu Archivo */}
               <div className="relative">
                  <button 
                    onClick={triggerImport}
                    className="px-2 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Archivo
                  </button>
               </div>

               {/* Menu Editar */}
               <div className="relative">
                 <button 
                    onClick={() => toggleMenu('edit')}
                    className={`px-2 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ${activeMenu === 'edit' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : ''}`}
                 >
                   Editar
                 </button>
                 <MenuDropdown isOpen={activeMenu === 'edit'} onClose={closeMenu}>
                    <MenuItem onClick={() => { onAddLab(); closeMenu(); }} icon={<Plus size={14} />}>Nuevo Laboratorio</MenuItem>
                    <MenuItem onClick={() => { onNavigate('SETTINGS'); closeMenu(); }} icon={<Settings size={14} />}>Configuración General</MenuItem>
                 </MenuDropdown>
               </div>

               {/* Menu Ver */}
               <div className="relative">
                 <button 
                    onClick={() => toggleMenu('view')}
                    className={`px-2 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ${activeMenu === 'view' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : ''}`}
                 >
                   Ver
                 </button>
                 <MenuDropdown isOpen={activeMenu === 'view'} onClose={closeMenu}>
                    <MenuItem onClick={() => { onNavigate('DASHBOARD'); closeMenu(); }}>Ir a Dashboard</MenuItem>
                    <MenuItem onClick={() => { onNavigate('LABS_LIST'); closeMenu(); }}>Ir a Laboratorios</MenuItem>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1"></div>
                    <MenuItem onClick={() => { toggleSidebar(); closeMenu(); }} icon={sidebarOpen ? <PanelLeftClose size={14}/> : <PanelLeftOpen size={14}/>}>
                      {sidebarOpen ? 'Ocultar Barra Lateral' : 'Mostrar Barra Lateral'}
                    </MenuItem>
                    <MenuItem onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); closeMenu(); }} icon={theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}>
                       Alternar Tema
                    </MenuItem>
                 </MenuDropdown>
               </div>

               {/* Menu Ayuda */}
               <div className="relative">
                 <button 
                    onClick={() => toggleMenu('help')}
                    className={`px-2 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ${activeMenu === 'help' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : ''}`}
                 >
                   Ayuda
                 </button>
                 <MenuDropdown isOpen={activeMenu === 'help'} onClose={closeMenu}>
                    <MenuItem onClick={() => { onShowAbout(); closeMenu(); }} icon={<Info size={14}/>}>Acerca de NiceLIMS</MenuItem>
                 </MenuDropdown>
               </div>

             </div>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          onChange={onImport} 
          className="hidden" 
        />
        
        <button onClick={onExport} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400" title="Exportar JSON">
          <Download size={18} />
        </button>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>

        <button 
          onClick={() => setTheme('light')} 
          className={`p-2 rounded-full ${theme === 'light' ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600' : 'text-zinc-500'}`}
          title="Tema Claro"
        >
          <Sun size={18} />
        </button>
        <button 
          onClick={() => setTheme('dark')} 
          className={`p-2 rounded-full ${theme === 'dark' ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600' : 'text-zinc-500'}`}
          title="Tema Oscuro"
        >
          <Moon size={18} />
        </button>
        <button 
          onClick={() => setTheme('system')} 
          className={`p-2 rounded-full ${theme === 'system' ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600' : 'text-zinc-500'}`}
          title="Tema Automático"
        >
          <Monitor size={18} />
        </button>
      </div>
    </div>
  );
};