import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import { GameStatus, ScoreState } from './types';
import { Gavel, Trophy, Zap, AlertCircle, DollarSign } from 'lucide-react';

const GAME_DURATION = 45; // slightly longer for strategy

export default function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    highScore: 0,
    whacks: 0,
    misses: 0,
    combo: 0,
    maxCombo: 0,
    moneySaved: 0
  });

  const resetScore = () => {
      setScoreState(prev => ({
          ...prev,
          score: 0,
          whacks: 0,
          misses: 0,
          combo: 0,
          moneySaved: 0
      }));
  };

  const updateScore = (points: number, isHit: boolean, currentCombo: number, moneySaved: number) => {
    setScoreState((prev) => {
      const multiplier = isHit ? (1 + (currentCombo * 0.1)) : 1;
      const finalPoints = Math.floor(points * multiplier);
      const newScore = Math.max(0, prev.score + finalPoints);
      
      return {
        ...prev,
        score: newScore,
        highScore: Math.max(newScore, prev.highScore),
        whacks: isHit ? prev.whacks + 1 : prev.whacks,
        misses: !isHit ? prev.misses + 1 : prev.misses,
        combo: currentCombo,
        maxCombo: Math.max(currentCombo, prev.maxCombo),
        moneySaved: prev.moneySaved + moneySaved
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-6 px-4 select-none font-sans overflow-x-hidden">
      
      {/* Header */}
      <header className="w-full max-w-2xl flex flex-col items-center mb-6 space-y-1 z-10">
        <div className="flex items-center gap-3 text-red-600 drop-shadow-[0_2px_15px_rgba(220,38,38,0.5)]">
          <Gavel className="w-8 h-8 md:w-12 md:h-12" strokeWidth={3} />
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-center" style={{fontFamily: '"Noto Serif SC", serif'}}>
            打死那个律师
          </h1>
          <Gavel className="w-8 h-8 md:w-12 md:h-12 transform scale-x-[-1]" strokeWidth={3} />
        </div>
        <p className="text-slate-400 text-xs md:text-sm italic text-center max-w-lg">
          “用正义的重锤，粉碎那些荒谬的借口。”
        </p>
      </header>

      {/* Scoreboard */}
      <div className="w-full max-w-2xl bg-slate-800 rounded-xl p-3 mb-6 border border-slate-700 shadow-2xl grid grid-cols-3 gap-2 z-10 relative overflow-hidden">
        {/* Bg accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
        
        <div className="flex flex-col items-center border-r border-slate-700">
           <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">正义值 (得分)</span>
           <span className="text-xl md:text-3xl font-black text-white drop-shadow-md">{scoreState.score}</span>
        </div>
        
        <div className="flex flex-col items-center border-r border-slate-700">
           <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">为您省下</span>
           <div className="flex items-center gap-1">
             <span className="text-lg md:text-2xl font-bold text-green-400 font-mono">¥{scoreState.moneySaved}</span>
           </div>
        </div>

        <div className="flex flex-col items-center">
           <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">最高连击</span>
           <div className="flex items-center gap-1">
             <Zap className="w-3 h-3 text-yellow-400" fill="currentColor" />
             <span className="text-lg md:text-2xl font-bold text-yellow-100">{scoreState.maxCombo}</span>
           </div>
        </div>
      </div>

      {/* Main Game Area */}
      <main className="w-full flex-grow flex flex-col items-center z-10">
        <GameBoard 
          status={status} 
          setStatus={setStatus} 
          updateScore={updateScore}
          resetScore={resetScore}
          gameDuration={GAME_DURATION}
        />
      </main>

      {/* Footer */}
      <footer className="mt-8 text-slate-600 text-[10px] text-center max-w-md z-0 flex flex-col gap-1">
        <p>DeepSeek AI 驱动：实时生成律政借口</p>
        <p>免责声明: 本游戏纯属虚构，仅供娱乐发泄，请勿在法庭上模仿。</p>
      </footer>
    </div>
  );
}