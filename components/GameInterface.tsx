
import React, { useState, useEffect, useRef } from 'react';
import { Character, GameMessage, WorldState, Item, ANIME_TIMELINE, NPCRelationship, User } from '../types';
import { generateNarrative, generateSceneImage } from '../services/geminiService';
import Hub from './Inventory';

interface Props {
  character: Character;
  updateCharacter: (char: Character) => void;
  onPvP: () => void;
  onGameOver: () => void;
}

const StatusBar = ({ value, max, color, label, icon }: any) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const isCritical = percentage < 25;
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <div className="flex justify-between items-center px-1">
        <span className="text-[7px] font-bungee text-white/40 tracking-widest flex items-center gap-1">
            {icon} {label}
        </span>
        <span className={`text-[9px] font-mono ${isCritical ? 'text-red-500 animate-pulse font-bold' : 'text-white/70'}`}>
          {Math.floor(value)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-black/80 border border-white/10 overflow-hidden relative p-[1px]">
        <div 
          className={`h-full ${color} transition-all duration-1000 relative ${isCritical ? 'animate-critical' : ''}`} 
          style={{ width: `${percentage}%` }}
        >
        </div>
      </div>
    </div>
  );
};

const GameInterface: React.FC<Props> = ({ character, updateCharacter, onPvP, onGameOver }) => {
  const [history, setHistory] = useState<GameMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const [showBonds, setShowBonds] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(["Gritar o nome do golpe", "Tentar um flashback triste", "Pedir iFood para a maldição"]);
  const [shake, setShake] = useState(false);
  
  const [worldState, setWorldState] = useState<WorldState>({
      currentArcId: ANIME_TIMELINE[0].id,
      arcProgress: 0,
      currentLocation: character.origin === 'Maldição' ? "Um esgoto chique" : "Sala de aula vazia",
      chaosLevel: 10,
      npcRelationships: {}
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.length === 0) {
        handleAction(`SYSTEM: Chegar na cena com ${character.motivation}`);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, isThinking]);

  const handleAction = async (action: string) => {
    if (isThinking) return;
    setIsThinking(true);
    
    const isSystem = action.startsWith("SYSTEM:");
    if (!isSystem) {
        setHistory(prev => [...prev, { role: 'player', content: action }]);
    }

    try {
      const response = await generateNarrative(character, history, isSystem ? action.replace("SYSTEM: ", "") : action, worldState);
      let newChar = { ...character };
      
      if (response.kokusen) {
          setShake(true);
          setTimeout(() => setShake(false), 600);
      }

      if (response.actionEvaluation) {
          newChar.currentHp = Math.max(0, Math.min(newChar.stats.forca * 20, newChar.currentHp + (response.hpChange || 0)));
          newChar.currentQi = Math.max(0, Math.min(newChar.stats.energia * 15, newChar.currentQi - (response.actionEvaluation.qiCost || 0)));
          newChar.xp += (response.xpGain || 0);
          
          if (newChar.currentHp <= 0) {
              onGameOver();
              return;
          }
      }

      if (response.chaosIncrease) {
          setWorldState(prev => ({ ...prev, chaosLevel: Math.min(100, prev.chaosLevel + response.chaosIncrease) }));
      }

      const imageUrl = (response.imagePrompt) ? await generateSceneImage(response.imagePrompt) : undefined;
      
      setHistory(prev => [...prev, { 
          role: 'narrator', 
          content: response.narrative, 
          imageUrl, 
          kokusen: response.kokusen,
          npcIntervention: response.interventionOccurred,
      }]);
      updateCharacter(newChar);
      if (response.suggestions) setSuggestions(response.suggestions);
    } catch (e) {
      setHistory(prev => [...prev, { role: 'narrator', content: "A realidade bugou. Provavelmente culpa do roteirista." }]);
    } finally {
      setIsThinking(false);
      setInput('');
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full max-w-6xl mx-auto overflow-hidden relative ${shake ? 'shake' : ''}`}>
      
      {/* HUD SUPERIOR */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 pointer-events-none">
          <div className="flex justify-between items-start max-w-5xl mx-auto w-full gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-white/10 w-64 md:w-80 pointer-events-auto bg-black/80 shadow-2xl">
                  <div className="flex items-center gap-3 mb-3">
                      <img src={character.profileImageUrl} className="w-14 h-14 rounded-xl border-2 border-purple-500 object-cover" alt="Profile" />
                      <div className="overflow-hidden">
                          <div className="text-[12px] font-bungee text-white leading-none mb-1 truncate">{character.name}</div>
                          <div className="text-[8px] font-mono text-purple-400 italic">"{character.technique}"</div>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <StatusBar value={character.currentHp} max={character.stats.forca * 20} color="bg-red-500" label="VONTADE DE VIVER" icon="💖" />
                      <StatusBar value={character.currentQi} max={character.stats.energia * 15} color="bg-blue-500" label="ENERGIA (MEME)" icon="⚡" />
                  </div>
              </div>

              <div className="flex flex-col items-end gap-2 pointer-events-auto">
                  <div className="glass-panel px-4 py-2 rounded-xl bg-purple-900/40 border border-purple-500/40 shadow-lg">
                      <div className="flex flex-col items-end">
                          <span className="text-[7px] font-bungee text-purple-300">NÍVEL DE CAOS</span>
                          <span className="text-xl font-bungee text-white leading-none">{worldState.chaosLevel}%</span>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => setShowHub(true)} className="w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-xl hover:bg-purple-500/20 shadow-lg bg-black/80">⚙️</button>
                  </div>
              </div>
          </div>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="flex-1 overflow-y-auto pt-44 pb-48 px-4 md:px-12 space-y-12 no-scrollbar" ref={scrollRef}>
          {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} animate-message`}>
                  <div className={`max-w-2xl w-full p-6 md:p-8 rounded-[2.5rem] border shadow-2xl relative ${
                      msg.role === 'player' 
                      ? 'bg-purple-600/20 border-purple-500/40 text-purple-100 font-marker text-xl md:text-2xl text-right' 
                      : 'bg-black/90 border-white/5 text-gray-200'
                  }`}>
                      {msg.kokusen && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-bungee px-4 py-1 rounded-full text-[10px] animate-bounce z-10 shadow-[0_0_20px_rgba(234,179,8,0.8)]">
                            KOKUSEN DE COMÉDIA!
                          </div>
                      )}

                      {msg.imageUrl && (
                          <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
                              <img src={msg.imageUrl} className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity" alt="Scene" />
                          </div>
                      )}
                      
                      {msg.npcIntervention && (
                          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/40 rounded-xl text-[10px] font-bungee text-blue-300 flex items-center gap-2">
                              <span>🌟</span> {msg.npcIntervention} entrou na cena só pra atrapalhar!
                          </div>
                      )}

                      <div className="text-lg md:text-xl leading-relaxed font-inter font-medium italic">
                          {msg.content}
                      </div>
                  </div>
              </div>
          ))}
          {isThinking && (
              <div className="flex justify-center py-6">
                  <div className="glass-panel px-6 py-2 rounded-full border border-purple-500/40 bg-black/90 text-[10px] font-bungee text-purple-400 animate-pulse tracking-widest uppercase">
                    O Narrador está preparando uma piada...
                  </div>
              </div>
          )}
      </div>

      {/* FOOTER INPUT */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {suggestions.map((s, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleAction(s)} 
                        disabled={isThinking} 
                        className="px-5 py-2 glass-panel border border-white/10 rounded-full text-[8px] font-bungee text-white/50 hover:text-white hover:border-purple-500/50 transition-all uppercase whitespace-nowrap bg-black/60"
                      >
                          {s}
                      </button>
                  ))}
              </div>
              <form onSubmit={e => { e.preventDefault(); if(input.trim()) handleAction(input); }} className="flex gap-3">
                  <input 
                    className="flex-1 glass-panel border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none transition-all font-inter shadow-2xl bg-black/80 placeholder:text-white/20" 
                    placeholder="Sua próxima ação absurda..." 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    disabled={isThinking} 
                  />
                  <button 
                    disabled={isThinking || !input.trim()} 
                    className="px-10 bg-white text-black font-bungee rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-xl text-sm"
                  >
                    MANDAR
                  </button>
              </form>
          </div>
      </div>

      {showHub && (
        <Hub 
          character={character} 
          worldState={worldState}
          updateCharacter={updateCharacter} 
          onClose={() => setShowHub(false)} 
          onPvP={() => { setShowHub(false); onPvP(); }}
        />
      )}
    </div>
  );
};

export default GameInterface;
