
import React, { useState } from 'react';
import { Character, Origin, CANON_TECHNIQUES, Rarity, Grade } from '../types';
import { generateCharacterProfile } from '../services/geminiService';

interface Props {
  onComplete: (char: Character) => void;
}

const MOTIVATIONS = [
  "Pagar o aluguel atrasado",
  "Impressionar alguém que não sabe que eu existo",
  "Descobrir quem roubou meu pudim na geladeira da escola",
  "Ser o protagonista mas sem ter que treinar",
  "Vingar meu hamster de estimação",
  "Só estou aqui pelo buffet livre de energia amaldiçoada"
];

const CharacterCreation: React.FC<Props> = ({ onComplete }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [techniqueObtained, setTechniqueObtained] = useState<{name: string, rarity: Rarity} | null>(null);

  const [char, setChar] = useState<Character>({
    name: '',
    origin: 'Humano',
    appearance: '',
    motivation: MOTIVATIONS[0],
    technique: '',
    techniqueDescription: '',
    techniqueMastery: 5,
    grade: 'Figurante Irrelevante',
    level: 1,
    xp: 0,
    nextLevelXp: 500,
    spins: 5,
    stats: { forca: 10, energia: 10, qi: 10, sorte: 5, protagonismo: 1 },
    currentHp: 200,
    currentQi: 150,
    inventory: [],
    profileImageUrl: ''
  });

  const handleOriginChange = (origin: Origin) => {
    setChar(prev => ({
      ...prev,
      origin,
      stats: origin === 'Maldição' 
        ? { forca: 15, energia: 12, qi: 15, sorte: 3, protagonismo: 0 } 
        : { forca: 10, energia: 10, qi: 10, sorte: 7, protagonismo: 2 }
    }));
  };

  const handleSpin = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const rand = Math.random() * 100;
      let rarity: Rarity = 'Comum';
      if (rand > 99) rarity = 'Grau Especial';
      else if (rand > 95) rarity = 'Lendário';
      else if (rand > 85) rarity = 'Épico';
      else if (rand > 60) rarity = 'Raro';

      const pool = CANON_TECHNIQUES[rarity];
      const selected = pool[Math.floor(Math.random() * pool.length)];
      
      setTechniqueObtained({ name: selected.name, rarity });
      setChar(prev => ({ 
        ...prev, 
        technique: selected.name, 
        techniqueDescription: selected.desc,
        spins: prev.spins - 1 
      }));
      setIsSpinning(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel p-8 sm:p-12 rounded-[3rem] border border-white/10 animate-in zoom-in duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
      <h2 className="text-4xl sm:text-6xl font-bungee text-white text-center mb-2 italic">JUJUTSU PARÓDIA</h2>
      <p className="text-center text-purple-400 font-mono text-[10px] mb-8 tracking-[0.3em]">CRIE SEU RECEPTÁCULO DISFUNCIONAL</p>
      
      <div className="space-y-6 mb-12">
        <input 
          className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-2xl font-marker text-purple-400 outline-none focus:border-purple-500 transition-all"
          placeholder="NOME DO (FUTURO) DEFUNTO"
          value={char.name}
          onChange={e => setChar({...char, name: e.target.value})}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleOriginChange('Humano')} className={`p-4 rounded-xl border-2 font-bungee transition-all ${char.origin === 'Humano' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-white/5 opacity-40 text-white/50'}`}>VÍTIMA DA SOCIEDADE</button>
          <button onClick={() => handleOriginChange('Maldição')} className={`p-4 rounded-xl border-2 font-bungee transition-all ${char.origin === 'Maldição' ? 'border-red-600 bg-red-600/10 text-white' : 'border-white/5 opacity-40 text-white/50'}`}>ERRO DA NATUREZA</button>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-bungee text-white/30 ml-2">MOTIVAÇÃO NO ROTEIRO</label>
            <select 
                className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-500 font-inter text-sm"
                value={char.motivation}
                onChange={e => setChar({...char, motivation: e.target.value})}
            >
                {MOTIVATIONS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>
      </div>

      <div className="mb-12 p-8 bg-black/40 rounded-[2rem] border border-white/5 text-center relative overflow-hidden">
        {isSpinning ? (
          <div className="h-32 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-t-purple-500 border-white/10 rounded-full animate-spin"></div>
          </div>
        ) : techniqueObtained ? (
          <div className="h-32 flex flex-col items-center justify-center animate-in zoom-in">
            <span className="text-[10px] font-bungee text-purple-500 mb-1">{techniqueObtained.rarity}</span>
            <span className="text-4xl font-marker text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">{techniqueObtained.name}</span>
            <button onClick={handleSpin} disabled={char.spins <= 0} className="mt-4 text-[9px] font-bungee text-white/30 hover:text-white transition-colors underline">TROCAR (TENHO {char.spins} 🌀)</button>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center">
            <button onClick={handleSpin} className="px-8 py-4 bg-purple-600 text-white font-bungee rounded-xl hover:scale-105 transition-all shadow-lg">SORTEAR TÉCNICA</button>
          </div>
        )}
      </div>

      <button 
        disabled={!char.technique || !char.name}
        onClick={() => {
            setIsGenerating(true);
            generateCharacterProfile(`${char.origin}, ${char.name}, funny, technique: ${char.technique}`, char.name).then(url => {
                if(url) {
                    onComplete({...char, profileImageUrl: url});
                } else {
                    onComplete(char);
                }
            });
        }}
        className="w-full py-6 bg-white text-black font-bungee rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-2xl disabled:opacity-10 uppercase tracking-widest"
      >
        {isGenerating ? 'ENTRANDO NO ROTEIRO...' : 'COMEÇAR A COMÉDIA'}
      </button>
    </div>
  );
};

export default CharacterCreation;
