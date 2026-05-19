import React from 'react';
import { Bot, AlertCircle } from 'lucide-react';

const IAErrorAlert = ({ mensajeOriginal, explicacionIA }) => {
  if (!mensajeOriginal && !explicacionIA) return null;

  return (
    <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-red-100 rounded-full">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-red-800">Error de la DIAN</h3>
          <p className="text-xs text-red-700 italic mt-1 font-mono">{mensajeOriginal}</p>
        </div>
      </div>

      {explicacionIA && (
        <div className="mt-4 p-3 bg-white rounded-md border border-blue-100 flex items-start space-x-3">
          <Bot className="w-5 h-5 text-blue-500 mt-1" />
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Análisis del Asistente KAVE</p>
            <p className="text-sm text-gray-700 leading-relaxed">{explicacionIA}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IAErrorAlert;