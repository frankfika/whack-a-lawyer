import React, { useEffect, useState } from 'react';
import { Lawyer, LawyerType } from '../types';

interface LawyerMoleProps {
  lawyer: Lawyer;
  onWhack: (id: number, e: React.MouseEvent) => void;
}

const LawyerMole: React.FC<LawyerMoleProps> = ({ lawyer, onWhack }) => {
  const [isHitAnim, setIsHitAnim] = useState(false);
  const [currentBill, setCurrentBill] = useState(0);

  // Trigger wobble animation on hit
  useEffect(() => {
    if (lawyer.health < lawyer.maxHealth && lawyer.isActive) {
       setIsHitAnim(true);
       const timer = setTimeout(() => setIsHitAnim(false), 200);
       return () => clearTimeout(timer);
    }
  }, [lawyer.health, lawyer.isActive, lawyer.maxHealth]);

  // Billing Counter Effect
  useEffect(() => {
      if (lawyer.isActive && lawyer.health > 0) {
          setCurrentBill(0);
          const interval = setInterval(() => {
              setCurrentBill(prev => prev + (lawyer.type === 'BILLER' ? 100 : 20));
          }, 500);
          return () => clearInterval(interval);
      }
  }, [lawyer.isActive, lawyer.type, lawyer.health]);

  const handleWhack = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (lawyer.isActive && lawyer.health > 0) {
      // Convert touch event to mouse event format for position calculation
      const mouseEvent = 'touches' in e
        ? { ...e, clientX: e.touches[0]?.clientX || 0, clientY: e.touches[0]?.clientY || 0 } as unknown as React.MouseEvent
        : e as React.MouseEvent;
      onWhack(lawyer.id, mouseEvent);
    }
  };

  // --- Avatar Components ---
  
  const Suit = ({ color, tieColor }: { color: string, tieColor: string }) => (
    <div className="absolute bottom-0 w-full h-12 flex justify-center overflow-hidden rounded-b-xl z-10">
        {/* Jacket */}
        <div className={`w-20 h-16 ${color} rounded-t-[20px] relative`}>
            {/* Shirt V */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-12 bg-white clip-path-v"></div>
             {/* Tie */}
             <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-10 ${tieColor}`}></div>
             {/* Lapels */}
             <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-${color.replace('bg-', '')}-800 opacity-20`}></div>
        </div>
    </div>
  );

  const Face = ({ type, emotion }: { type: LawyerType, emotion: 'normal' | 'hit' | 'dead' }) => {
    const skinTone = type === 'AGGRESSOR' ? 'bg-orange-200' : 'bg-amber-100';
    
    // Expressions
    let eyes = (
        <div className="flex gap-4 mt-8">
            <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
        </div>
    );
    let mouth = <div className="w-6 h-1 bg-slate-800 mt-2 rounded-full"></div>;
    let extras = null;

    if (emotion === 'hit') {
        eyes = (
            <div className="flex gap-4 mt-8">
                <div className="text-xl font-black">{'>'}</div>
                <div className="text-xl font-black">{'<'}</div>
            </div>
        );
        mouth = <div className="w-4 h-4 rounded-full border-2 border-slate-800 mt-1"></div>;
    } else if (emotion === 'dead') {
         return <div className="text-6xl mt-6">😵</div>;
    } else {
        // Specific Type Faces
        if (type === 'BILLER') {
             // Greedy Eyes
             eyes = (
                <div className="flex gap-4 mt-8 text-green-700 font-bold text-xs items-center">
                    <span>¥</span><span>¥</span>
                </div>
             );
             mouth = <div className="w-8 h-4 border-b-2 border-slate-800 rounded-full mt-[-5px]"></div>; // Smug smile
        } else if (type === 'AGGRESSOR') {
            // Angry Eyebrows
            eyes = (
                <div className="relative mt-8">
                    <div className="absolute -top-2 -left-2 w-4 h-1 bg-black rotate-12"></div>
                    <div className="absolute -top-2 left-4 w-4 h-1 bg-black -rotate-12"></div>
                    <div className="flex gap-4">
                         <div className="w-2 h-2 bg-black rounded-full"></div>
                         <div className="w-2 h-2 bg-black rounded-full"></div>
                    </div>
                </div>
            );
            mouth = <div className="w-6 h-3 bg-red-900 rounded-t-full mt-2 rotate-180"></div>; // Frown
        } else if (type === 'PEDANT') {
            // Glasses
            extras = (
                <div className="absolute top-7 w-16 h-4 border-2 border-black rounded-lg bg-blue-100/30 flex justify-between items-center px-1">
                    <div className="w-1 h-1 bg-white rounded-full opacity-80"></div>
                </div>
            );
            mouth = <div className="w-4 h-1 bg-slate-800 mt-3"></div>; // Straight face
        } else if (type === 'STALLER') {
            // Sleepy/Bored
            eyes = (
                <div className="flex gap-4 mt-9">
                    <div className="w-3 h-1 bg-slate-600"></div>
                    <div className="w-3 h-1 bg-slate-600"></div>
                </div>
            );
        }
    }

    return (
        <div className={`w-20 h-24 ${skinTone} rounded-xl relative flex flex-col items-center shadow-inner z-0`}>
             {/* Hair */}
             <div className={`absolute -top-2 w-22 h-10 w-full rounded-t-xl z-20 ${
                 type === 'BILLER' ? 'bg-gray-300' : // Silver fox
                 type === 'AGGRESSOR' ? 'bg-black' : 
                 type === 'STALLER' ? 'bg-amber-900' : // Balding handled by not covering enough
                 'bg-slate-700'
             }`}></div>
             {type === 'STALLER' && <div className="absolute -top-1 w-16 h-6 bg-amber-100 rounded-full z-30"></div>} {/* Balding spot */}

             {extras}
             {eyes}
             {mouth}
        </div>
    );
  };

  const getTheme = () => {
      switch (lawyer.type) {
          case 'BILLER': return { suit: 'bg-slate-800', tie: 'bg-yellow-400', color: 'text-yellow-400' };
          case 'AGGRESSOR': return { suit: 'bg-blue-900', tie: 'bg-red-600', color: 'text-red-500' };
          case 'PEDANT': return { suit: 'bg-gray-600', tie: 'bg-blue-300', color: 'text-blue-300' };
          case 'STALLER': return { suit: 'bg-amber-800', tie: 'bg-gray-400', color: 'text-gray-400' };
          default: return { suit: 'bg-gray-800', tie: 'bg-black', color: 'text-white' };
      }
  };

  const theme = getTheme();

  return (
    <div className="relative w-full h-32 sm:h-44 flex justify-center items-end overflow-hidden rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 border-b-4 border-gray-700 shadow-inner group touch-manipulation">
      {/* Nameplate / Desk */}
      <div className="absolute bottom-0 w-full h-8 bg-[#3d2b1f] border-t-2 border-[#5c4033] flex items-center justify-center z-30 shadow-lg">
          <div className="bg-yellow-600/20 px-2 py-0.5 rounded text-[10px] sm:text-xs text-yellow-500 font-serif tracking-widest uppercase truncate max-w-[90%]">
              {lawyer.subTitle}
          </div>
      </div>

      {/* The Lawyer Character */}
      <div
        onMouseDown={handleWhack}
        onTouchStart={handleWhack}
        className={`
          absolute bottom-6 w-24 sm:w-28 h-28 sm:h-32
          flex flex-col items-center justify-end cursor-pointer select-none
          transition-all duration-150 ease-out z-10
          ${lawyer.isActive ? 'translate-y-0' : 'translate-y-[120%]'}
          ${isHitAnim ? 'scale-95 translate-y-2 rotate-2 blur-[1px]' : ''}
          active:brightness-125 hover:brightness-110
        `}
      >
        {/* Taunt Bubble */}
        <div
          className={`
            absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2
            w-28 sm:w-36 bg-white text-gray-900 text-[10px] sm:text-xs font-bold p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-xl
            border-2 border-gray-200 z-50 text-center
            transition-all duration-200 origin-bottom
            ${lawyer.isActive && lawyer.health > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50 translate-y-10'}
          `}
          style={{pointerEvents: 'none'}}
        >
          "{lawyer.taunt}"
          {/* Bill Counter attached to bubble */}
          <div className="absolute -top-2.5 sm:-top-3 -right-1.5 sm:-right-2 bg-green-600 text-white text-[8px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded shadow border border-green-400">
             ¥{currentBill}
          </div>
          <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 sm:border-l-8 border-r-6 sm:border-r-8 border-t-6 sm:border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
        </div>

        {/* Health / Armor */}
        {lawyer.maxHealth > 1 && (
             <div className="absolute top-0 right-0 z-40">
                 {Array.from({length: lawyer.health}).map((_, i) => (
                     <span key={i} className="text-sm">🛡️</span>
                 ))}
             </div>
        )}

        <div className={`relative transition-transform ${isHitAnim ? 'shake' : ''}`}>
             <Face type={lawyer.type} emotion={lawyer.health <= 0 ? 'dead' : isHitAnim ? 'hit' : 'normal'} />
             <Suit color={theme.suit} tieColor={theme.tie} />
        </div>
      </div>
    </div>
  );
};

export default LawyerMole;