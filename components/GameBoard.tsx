import React, { useState, useEffect, useRef, useCallback } from 'react';
import LawyerMole from './LawyerMole';
import { Lawyer, GameStatus, Particle, LawyerType } from '../types';
import { generateLawyerTaunts } from '../services/aiService';
import { Loader2, Gavel, Zap, DollarSign } from 'lucide-react';

interface GameBoardProps {
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
  updateScore: (points: number, isHit: boolean, combo: number, moneySaved: number) => void;
  resetScore: () => void;
  gameDuration: number;
}

const GRID_SIZE = 9;
const INITIAL_SPEED = 1200; // Slower start
const MIN_SPEED = 700;      // Slower max speed

const GameBoard: React.FC<GameBoardProps> = ({ status, setStatus, updateScore, resetScore, gameDuration }) => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [tauntPool, setTauntPool] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [isLoading, setIsLoading] = useState(false);
  const [combo, setCombo] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shake, setShake] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentSpeedRef = useRef(INITIAL_SPEED);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize grid
  useEffect(() => {
    const initialLawyers: Lawyer[] = Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      isActive: false,
      type: 'STALLER',
      taunt: '',
      subTitle: '',
      displayDuration: 1500,
      health: 1,
      maxHealth: 1,
      billAmount: 0
    }));
    setLawyers(initialLawyers);
  }, []);

  // Pre-fetch AI taunts
  useEffect(() => {
    const fetchTaunts = async () => {
      setIsLoading(true);
      const taunts = await generateLawyerTaunts();
      setTauntPool(taunts);
      setIsLoading(false);
    };
    fetchTaunts();
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const spawnParticle = (x: number, y: number, content: string | React.ReactNode, color: string) => {
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, x, y, content, color }]);
    setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== id));
    }, 1200); // Longer life for reading
  };

  const getLawyerConfig = (): { type: LawyerType, hp: number, sub: string } => {
    const rand = Math.random();
    if (rand > 0.85) return { type: 'BILLER', hp: 2, sub: '高级合伙人' }; 
    if (rand > 0.60) return { type: 'AGGRESSOR', hp: 1, sub: '诉讼狂人' };
    if (rand > 0.35) return { type: 'PEDANT', hp: 1, sub: '法条怪' };
    return { type: 'STALLER', hp: 1, sub: '资深顾问' };
  };

  const getTauntForType = useCallback((type: LawyerType) => {
    const pool = tauntPool[type];
    if (!pool || pool.length === 0) return "我反对！";
    return pool[Math.floor(Math.random() * pool.length)];
  }, [tauntPool]);

  // Main Game Loop
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      moleTimerRef.current = setInterval(() => {
        setLawyers(prev => {
           // 1. Auto-hide
           const now = Date.now();
           const next = prev.map(l => {
              // Reduced hide probability from 0.45 to 0.25 to let users read text
              if (l.isActive && Math.random() > 0.25) {
                  return { ...l, isActive: false };
              }
              return l;
           });

           // 2. Spawn logic
           // Max 3 active at once
           const activeCount = next.filter(l => l.isActive).length;
           if (activeCount < 4) {
               const idx = Math.floor(Math.random() * GRID_SIZE);
               if (!next[idx].isActive) {
                   const config = getLawyerConfig();
                   next[idx] = {
                       ...next[idx],
                       isActive: true,
                       type: config.type,
                       health: config.hp,
                       maxHealth: config.hp,
                       taunt: getTauntForType(config.type),
                       subTitle: config.sub,
                       billAmount: 0
                   };
               }
           }
           return next;
        });

        // Slower acceleration
        currentSpeedRef.current = Math.max(MIN_SPEED, currentSpeedRef.current * 0.998);

      }, currentSpeedRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStatus(GameStatus.FINISHED);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, setStatus, getTauntForType]);

  const handleStartGame = () => {
    setTimeLeft(gameDuration);
    currentSpeedRef.current = INITIAL_SPEED;
    setLawyers(prev => prev.map(l => ({ ...l, isActive: false })));
    setCombo(0);
    resetScore();
    setStatus(GameStatus.PLAYING);
  };

  const handleBoardClick = (e: React.MouseEvent) => {
      if (status !== GameStatus.PLAYING) return;
      setCombo(0);
      updateScore(-100, false, 0, 0); 
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          spawnParticle(x, y, "打空了!", "text-gray-400 font-bold text-sm");
      }
  };

  const getKillMessage = (type: LawyerType): string => {
      switch(type) {
          case 'BILLER': return "全额退款!";
          case 'PEDANT': return "反对无效!";
          case 'AGGRESSOR': return "吊销执照!";
          case 'STALLER': return "立刻执行!";
          default: return "驳回!";
      }
  };

  const handleWhack = (id: number, e: React.MouseEvent) => {
    if (status !== GameStatus.PLAYING) return;

    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : 0;
    const y = rect ? e.clientY - rect.top : 0;

    setLawyers((prev) => {
      const target = prev.find(l => l.id === id);
      if (!target || !target.isActive || target.health <= 0) return prev;

      const newHealth = target.health - 1;
      const isDead = newHealth <= 0;
      
      setCombo(c => c + 1);
      triggerShake();

      // Feedback Logic
      if (isDead) {
          // Kill Feedback
          const msg = getKillMessage(target.type);
          spawnParticle(x, y - 40, msg, "text-red-500 font-black text-2xl drop-shadow-md");
          
          // Drop Loot
          if (target.type === 'BILLER') {
             spawnParticle(x + 20, y, "💰", "text-3xl");
             spawnParticle(x - 20, y, "💰", "text-3xl");
          } else if (target.type === 'PEDANT') {
             spawnParticle(x, y, "📕", "text-3xl");
          }
      } else {
          // Hit Armor Feedback
          spawnParticle(x, y - 20, "还能抗?!", "text-yellow-400 font-bold");
      }

      const points = isDead ? (target.type === 'BILLER' ? 500 : 200) : 50;
      const moneySaved = isDead ? (target.type === 'BILLER' ? 1000 : 200) : 0;

      updateScore(points, true, combo + 1, moneySaved);

      return prev.map((l) =>
        l.id === id ? { ...l, health: newHealth, isActive: !isDead } : l
      );
    });
  };

  if (status === GameStatus.IDLE) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-900 rounded-xl border-4 border-gray-800 p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-md">
            <h2 className="text-4xl font-serif font-bold text-yellow-500 mb-6 drop-shadow-lg">准备开庭</h2>
            <div className="bg-gray-800/80 p-6 rounded-lg text-left border border-gray-700 mb-6">
                <h3 className="text-gray-300 font-bold mb-3 border-b border-gray-600 pb-2">被告名单 (Target List):</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                        <span className="bg-yellow-400 text-black text-xs px-1 rounded font-bold">高级合伙人</span>
                        <span>按秒计费的吸血鬼。弱点：退费。</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="bg-blue-300 text-black text-xs px-1 rounded font-bold">法条怪</span>
                        <span>死抠字眼的条文狂。弱点：驳回。</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="bg-red-500 text-white text-xs px-1 rounded font-bold">诉讼狂人</span>
                        <span>动不动就起诉。弱点：吊销执照。</span>
                    </li>
                </ul>
            </div>
            
            <button
            onClick={handleStartGame}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-black text-2xl rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95 border-b-4 border-red-900"
            >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> 正在传唤当事人...</span>
            ) : (
                "肃静! (开始游戏)"
            )}
            </button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.FINISHED) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-800 rounded-xl border-2 border-gray-700 p-8 text-center animate-pop-in">
        <h2 className="text-4xl font-bold text-white mb-2">休庭！</h2>
        <div className="text-xl text-gray-400 mb-6">本次庭审结束</div>
        
        <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm">
             <div className="bg-gray-700 p-4 rounded-lg">
                 <div className="text-gray-400 text-xs uppercase">最终正义值</div>
                 <div className="text-3xl text-yellow-400 font-bold">{updateScore.name} --</div> 
                 {/* Note: In real react we pass state, but here just UI placeholder logic matching previous pattern */}
             </div>
             <div className="bg-gray-700 p-4 rounded-lg">
                 <div className="text-gray-400 text-xs uppercase">省下律师费</div>
                 <div className="text-3xl text-green-400 font-bold">¥High</div>
             </div>
        </div>

        <button
          onClick={handleStartGame}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg w-full max-w-xs"
        >
          提起上诉 (再玩一次)
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto relative select-none" ref={containerRef}>
        {/* Particle Layer */}
        {particles.map(p => (
            <div 
                key={p.id}
                className={`absolute pointer-events-none animate-float-up z-50 whitespace-nowrap ${p.color}`}
                style={{ left: p.x, top: p.y }}
            >
                {p.content}
            </div>
        ))}

        {/* Timer Bar */}
        <div className="mb-4 w-full bg-gray-800 rounded-md h-8 overflow-hidden border border-gray-600 relative flex items-center px-3">
            <div className="flex-1 flex items-center gap-2 z-10 text-white font-mono font-bold">
                <span>倒计时:</span>
                <span className={`${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</span>
            </div>
            <div 
                className={`absolute left-0 top-0 h-full opacity-30 transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-red-600' : 'bg-blue-600'}`}
                style={{ width: `${(timeLeft / gameDuration) * 100}%` }}
            ></div>
        </div>

        {/* Combo Indicator */}
        <div className={`absolute -top-16 right-0 transition-all duration-100 ${combo > 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="flex flex-col items-end">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 italic tracking-tighter" style={{filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))'}}>
                    {combo}连击!
                </div>
            </div>
        </div>

        {/* Grid Container */}
        <div 
            onClick={handleBoardClick}
            className={`
                grid grid-cols-3 gap-y-8 gap-x-4 p-6 rounded-b-xl rounded-t-sm bg-[#1e293b] 
                border-t-[16px] border-[#334155] shadow-2xl cursor-pointer
                ${shake ? 'animate-shake' : ''}
            `}
            style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, #334155 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}
        >
            {lawyers.map((lawyer) => (
                <LawyerMole
                key={lawyer.id}
                lawyer={lawyer}
                onWhack={handleWhack}
                />
            ))}
        </div>
        
        {/* Floor Reflection/Shadow for depth */}
        <div className="w-[90%] mx-auto h-4 bg-black/40 blur-xl rounded-[100%]"></div>
    </div>
  );
};

export default GameBoard;