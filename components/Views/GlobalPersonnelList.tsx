import React from 'react';
import { UniversityData } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { User, Phone, MapPin, BadgeCheck, Briefcase } from 'lucide-react';

interface GlobalPersonnelListProps {
    data: UniversityData;
}

interface Person {
    name: string;
    contact: string;
    roles: Set<string>;
    locations: Set<string>;
}

export const GlobalPersonnelList: React.FC<GlobalPersonnelListProps> = ({ data }) => {

    // Logic to aggregate personnel
    const personnelMap = new Map<string, Person>();

    const addPerson = (name: string | undefined, contact: string | undefined, role: string, location?: string) => {
        if (!name || name.trim() === "") return;
        const cleanName = name.trim();
        const key = cleanName.toUpperCase();

        if (!personnelMap.has(key)) {
            personnelMap.set(key, {
                name: cleanName,
                contact: contact || "",
                roles: new Set([role]),
                locations: location ? new Set([location]) : new Set()
            });
        } else {
            const person = personnelMap.get(key)!;
            person.roles.add(role);
            if (location) person.locations.add(location);
            if (!person.contact && contact) person.contact = contact; // Prioritize having a contact
        }
    };

    // 1. Add Authorities from Root
    addPerson(data["DIRECTOR DEL PROGRAMA DE ESTUDIOS"], "", "Director Programa de Estudios");
    addPerson(data["DIRECTOR DEL DEPARTAMENTO ACADÉMICO"], "", "Director Departamento Académico");

    // 2. Iterate Labs
    (data.labs || []).forEach(lab => {
        const labName = `${lab.infoAmbiente?.["CÓDIGO DE LABORATORIO O TALLER"] || "S/C"} - ${lab.infoAmbiente?.["NOMBRE DEL LABORATORIO O TALLER"] || "Sin Nombre"}`;

        // Responsable
        const responsable = lab.infoAmbiente?.["RESPONSABLE DEL LABORATORIO O TALLER"];
        addPerson(responsable?.NOMBRE, responsable?.["NUMERO DE CONTACTO"], "Responsable de Laboratorio", labName);

        // CBC III
        const cbc = lab.infoAmbiente?.["PERSONAL ASIGNADO PARA VERIFICAR LA CBC III"];
        addPerson(cbc?.NOMBRE, cbc?.["NUMERO DE CONTACTO"], "Verificador CBC III", labName);

        // Technical Staff
        (lab.infoAmbiente?.["PERSONAL TÉCNICO"] || []).forEach(tech => {
            addPerson(tech.NOMBRE, tech["NUMERO DE CONTACTO"], "Personal Técnico", labName);
        });
    });

    const personnelList = Array.from(personnelMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Directorio de Personal</h2>
                    <p className="text-sm text-zinc-500">Listado unificado de responsables, técnicos y autoridades.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personnelList.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-zinc-500">No hay personal registrado en el sistema.</div>
                ) : (
                    personnelList.map((person, idx) => (
                        <Card key={idx} className="hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{person.name}</h3>
                                        {person.contact ? (
                                            <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-1">
                                                <Phone size={12} />
                                                <span>{person.contact}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-zinc-400 italic mt-1 block">Sin contacto registrado</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            <Briefcase size={12} /> Roles
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {Array.from(person.roles).map((role, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 text-xs rounded border border-blue-100 dark:border-blue-800/50">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {person.locations.size > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                <MapPin size={12} /> Ambientes Designados
                                            </p>
                                            <ul className="space-y-1">
                                                {Array.from(person.locations).map((loc, i) => (
                                                    <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded truncate">
                                                        {loc}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};