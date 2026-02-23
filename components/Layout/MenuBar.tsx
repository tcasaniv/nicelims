import React, { useRef, useState, useEffect } from 'react';
import { Download, Moon, Sun, Monitor, Menu, Plus, Info, Settings, PanelLeft, ChevronDown, ChevronRight, X, FileJson, Layout, HardDrive, Users, Cpu, FilePenLine, CalendarRange, ClipboardCheck } from 'lucide-react';
import { ThemeMode, ViewType } from '../../types';

interface MenuBarProps {
  fileName: string;
  onRename: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  onNavigate: (view: ViewType) => void;
  onAddLab: () => void;
  onShowAbout: () => void;
  onNewFile: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  fileName,
  onRename,
  onImport,
  onExport,
  theme,
  setTheme,
  toggleSidebar,
  onNavigate,
  onAddLab,
  onShowAbout,
  onNewFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Desktop Menus
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<string | null>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  // State for Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);

  const triggerImport = () => fileInputRef.current?.click();

  // Close desktop menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setActiveDesktopMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Menu Structure Definition
  const menuStructure = [
    {
      label: 'Archivo',
      items: [
        { label: 'Nuevo archivo', action: onNewFile, icon: <Plus size={14} /> },
        { label: 'Abrir archivo', action: triggerImport, icon: <FileJson size={14} /> },
        { label: 'Renombrar archivo', action: onRename, icon: <FilePenLine size={14} /> },
        { label: 'Exportar archivo', action: onExport, icon: <Download size={14} /> },
      ]
    },
    {
      label: 'Editar',
      items: [
        { label: 'Nuevo Laboratorio', action: onAddLab, icon: <Plus size={14} /> },
        { label: 'Configuración', action: () => onNavigate('SETTINGS'), icon: <Settings size={14} /> },
      ]
    },
    {
      label: 'Ver',
      items: [
        { label: 'Dashboard', action: () => onNavigate('DASHBOARD'), icon: <Layout size={14} /> },
        { label: 'Laboratorios', action: () => onNavigate('LABS_LIST'), icon: <Layout size={14} /> },
        { label: 'Equipos Globales', action: () => onNavigate('ALL_EQUIPMENT'), icon: <Cpu size={14} /> },
        { label: 'Software Global', action: () => onNavigate('ALL_SOFTWARE'), icon: <HardDrive size={14} /> },
        { label: 'Personal Global', action: () => onNavigate('ALL_PERSONNEL'), icon: <Users size={14} /> },
        { label: 'Plan de Mantenimiento', action: () => onNavigate('MAINTENANCE_PLAN'), icon: <CalendarRange size={14} /> },
        { label: 'Bitácora de Actividades', action: () => onNavigate('MAINTENANCE_LOGS'), icon: <ClipboardCheck size={14} /> },
      ]
    },
    {
      label: 'Ayuda',
      items: [
        { label: 'Acerca de NiceLIMS', action: onShowAbout, icon: <Info size={14} /> },
      ]
    }
  ];

  const handleMenuAction = (action: () => void) => {
    action();
    setActiveDesktopMenu(null);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileSection = (label: string) => {
    if (expandedMobileSection === label) {
      setExpandedMobileSection(null);
    } else {
      setExpandedMobileSection(label);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-12 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm select-none">

      {/* --- LEFT SECTION --- */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 md:hidden"
          title="Mostrar Barra Lateral"
        >
          <PanelLeft size={20} />
        </button>

        {/* --- DESKTOP MENU (Horizontal) --- */}
        <div className="hidden md:flex items-center gap-1" ref={desktopMenuRef}>
          {menuStructure.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                onClick={() => setActiveDesktopMenu(activeDesktopMenu === menu.label ? null : menu.label)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${activeDesktopMenu === menu.label
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
              >
                {menu.label}
              </button>

              {/* Dropdown */}
              {activeDesktopMenu === menu.label && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {menu.items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleMenuAction(item.action)}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2 group"
                    >
                      <span className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- MOBILE HAMBURGER --- */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* --- CENTER TITLE (Clickable) --- */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
        <button
          onClick={onRename}
          className="hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 px-1.5 py-0.5 rounded transition-colors"
          title="Renombrar archivo"
        >
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 px-6 py-1 rounded text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-2">
            <span>NiceLIMS</span>
            <span className="opacity-50">-</span>
            {fileName}
          </div>
        </button>
      </div>

      {/* --- RIGHT ACTIONS --- */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={onImport}
          className="hidden"
        />

        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 border border-zinc-200 dark:border-zinc-700">
          <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white dark:bg-zinc-700 shadow-sm text-yellow-500' : 'text-zinc-400'}`}><Sun size={14} /></button>
          <button onClick={() => setTheme('system')} className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-500' : 'text-zinc-400'}`}><Monitor size={14} /></button>
          <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-400' : 'text-zinc-400'}`}><Moon size={14} /></button>
        </div>
      </div>


      {/* --- MOBILE MENU OVERLAY (CASCADING) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <span className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Menú</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuStructure.map((section) => {
                const isExpanded = expandedMobileSection === section.label;
                return (
                  <div key={section.label} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-800/30">
                    <button
                      onClick={() => toggleMobileSection(section.label)}
                      className="w-full flex items-center justify-between p-3 text-left font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {section.label}
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {/* Cascading Content */}
                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                        {section.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleMenuAction(item.action)}
                            className="w-full text-left px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 pl-6 border-l-2 border-transparent hover:border-blue-500 transition-colors"
                          >
                            <span className="text-zinc-400">{item.icon}</span>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
              NiceLIMS v1.0
            </div>
          </div>
        </div>
      )}

    </header>
  );
};