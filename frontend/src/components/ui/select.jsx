import React, { useState, createContext, useContext, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

const SelectContext = createContext(null);

/**
 * Componente Select robusto con Context API.
 * Resuelve los problemas de comunicación entre Trigger, Value e Items.
 */
export const Select = ({ children, value, onValueChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState("");
    const containerRef = useRef(null);

    // Cerrar el dropdown al hacer clic fuera del componente
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, displayValue, setDisplayValue }}>
            <div className="relative w-full" ref={containerRef}>
                {children}
            </div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = ({ className = "", children }) => {
    const { isOpen, setIsOpen } = useContext(SelectContext);
    
    return (
        <div 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none transition-colors hover:border-slate-300 ${className}`}
        >
            {children}
            <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
    );
};

export const SelectValue = ({ placeholder = "Seleccionar..." }) => {
    const { displayValue, value } = useContext(SelectContext);
    
    return (
        <span className={`block truncate ${!value ? "text-slate-500" : "text-slate-900"}`}>
            {displayValue || placeholder}
        </span>
    );
};

export const SelectContent = ({ children, className = "" }) => {
    const { isOpen } = useContext(SelectContext);
    
    if (!isOpen) return null;
    
    return (
        <div className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95 ${className}`}>
            {children}
        </div>
    );
};

export const SelectItem = ({ value: itemValue, children, className = "" }) => {
    const { value: selectedValue, onValueChange, setIsOpen, setDisplayValue } = useContext(SelectContext);
    const isSelected = selectedValue === itemValue;

    // Sincronizar el texto mostrado con el item seleccionado (incluso en carga inicial)
    useEffect(() => {
        if (isSelected) {
            setDisplayValue(children);
        }
    }, [isSelected, children, setDisplayValue]);

    const handleSelect = (e) => {
        e.stopPropagation();
        onValueChange?.(itemValue);
        setDisplayValue(children);
        setIsOpen(false);
    };

    return (
        <div 
            onClick={handleSelect}
            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${isSelected ? "bg-slate-50 text-slate-900 font-medium" : "text-slate-700"} ${className}`}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4 text-slate-900" />}
            </span>
            {children}
        </div>
    );
};