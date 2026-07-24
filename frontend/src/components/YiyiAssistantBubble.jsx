import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

// 👇 1. IMPORT DE LA IMAGEN PNG DE LA ASISTENTE VIRTUAL:
import yiyiAvatar from '../assets/yiyiAvatar.png';

export const YiyiAssistantBubble = () => {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
      {/* Botón Flotante Redondo con temática en tonos Azules */}
      <div
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sky-100  p-[2px] shadow-[0_10px_25px_-5px_rgba(2,132,199,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(2,132,199,0.6)] transition-all duration-300 hover:scale-110 cursor-pointer select-none"
        title="Asistente Virtual Yiyi"
      >
        {/* Anillo de luz flotante exterior tipo Alexa / Siri */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 opacity-80 blur-md group-hover:opacity-100 transition-opacity animate-pulse" />

        {/* Contenedor circular interior: el padding (p-2 / p-2.5) reduce el tamaño de la imagen interna */}
        <div className="relative z-10 w-full h-full rounded-full bg-slate-900/90 backdrop-blur-md p-2 sm:p-2.5 flex items-center justify-center overflow-hidden border border-cyan-400/30">

          {/* 👇 2. IMAGEN CON 'object-contain' Y TAMAÑO AJUSTADO PARA QUE SE VEA COMPLETA */}
          {yiyiAvatar ? (
            <img
              src={yiyiAvatar}
              alt="Yiyi IA"
              /* object-contain asegura que NINGÚN borde de la imagen se corte y se aprecie todo el diseño */
              className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <Bot className="w-6 h-6 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
          )}

        </div>
      </div>

      {/* 👇 3. TEXTO Y BADGE PROFESIONAL "Intenta hablar con yiyi" EN AZULES */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 dark:bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-cyan-500/40 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-cyan-400 group">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="bg-gradient-to-r from-sky-200 via-cyan-100 to-white bg-clip-text text-transparent font-bold tracking-wide">
          ¡Di hola a Kai woop!🗣️
        </span>
      </div>
    </div>
  );
};

