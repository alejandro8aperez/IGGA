import React, { useState, createContext, useContext, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

const SelectContext = createContext(null);

export const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, displayValue, setDisplayValue }}>
      <div style={{ position: "relative", width: "100%" }} ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, style }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext);
  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      style={{
        display: "flex", height: "2.5rem", width: "100%", alignItems: "center",
        justifyContent: "space-between", borderRadius: "6px",
        border: isOpen ? "1px solid #667eea" : "1px solid #cbd5e1",
        background: "#fff", padding: "0 0.75rem", fontSize: "0.875rem",
        cursor: "pointer", userSelect: "none",
        boxShadow: isOpen ? "0 0 0 2px rgba(102,126,234,0.2)" : "none",
        outline: "none", transition: "border-color 0.15s",
        ...style,
      }}
    >
      {children}
      <ChevronDown
        size={16}
        style={{
          opacity: 0.5, flexShrink: 0, marginLeft: "0.5rem",
          transform: isOpen ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }}
      />
    </div>
  );
};

export const SelectValue = ({ placeholder = "Seleccionar..." }) => {
  const { displayValue, value } = useContext(SelectContext);
  return (
    <span style={{
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      color: value ? "#1e293b" : "#94a3b8", flex: 1,
    }}>
      {displayValue || placeholder}
    </span>
  );
};

export const SelectContent = ({ children, style }) => {
  const { isOpen } = useContext(SelectContext);
  if (!isOpen) return null;
  return (
    <div style={{
      position: "absolute", zIndex: 9999, top: "calc(100% + 4px)", left: 0, right: 0,
      maxHeight: "15rem", overflowY: "auto", borderRadius: "8px",
      border: "1px solid #e2e8f0", background: "#fff",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "4px",
      ...style,
    }}>
      {children}
    </div>
  );
};

export const SelectItem = ({ value: itemValue, children, style }) => {
  const { value: selectedValue, onValueChange, setIsOpen, setDisplayValue } = useContext(SelectContext);
  const isSelected = String(selectedValue) === String(itemValue);

  useEffect(() => {
    if (isSelected) setDisplayValue(children);
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
      style={{
        display: "flex", alignItems: "center", padding: "0.4rem 0.5rem 0.4rem 2rem",
        borderRadius: "4px", fontSize: "0.875rem", cursor: "pointer",
        position: "relative", color: isSelected ? "#1e293b" : "#475569",
        fontWeight: isSelected ? 600 : 400,
        background: isSelected ? "#f1f5f9" : "transparent",
        transition: "background 0.1s",
        ...style,
      }}
      onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
      onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
    >
      {isSelected && (
        <span style={{ position: "absolute", left: "0.5rem" }}>
          <Check size={13} color="#667eea" />
        </span>
      )}
      {children}
    </div>
  );
};
