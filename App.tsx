
import React, { useState } from 'react';
import { GameStage, Character, User, WorldState, ANIME_TIMELINE } from './types';
import CharacterCreation from './components/CharacterCreation';
import GameInterface from './components/GameInterface';
import PvPInterface from './components/PvPInterface';
import AuthScreen from './components/AuthScreen';

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>(GameStage.AUTH);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [character, setCharacter] = useState<Character | undefined>();

  const saveUserData = (updatedUser: User) => {
    const storedUsers = JSON.parse(localStorage.getItem('jj_users') || '{}');
    storedUsers[updatedUser.username] = updatedUser;
    localStorage.setItem('jj_users', JSON.stringify(storedUsers));
    setCurrentUser(updatedUser);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.character) {
      setCharacter(user.character);
      setStage(GameStage.PLAYING);
    } else {
      setStage(GameStage.START);
    }
  };

  const handleCharComplete = (char: Character) => {
    if (!currentUser) return;
    
    const isCurse = char.origin === 'Maldição';
    const initialWorld: WorldState = {
      currentArcId: ANIME_TIMELINE[0].id,
      arcProgress: 0,
      currentLocation: isCurse ? 'Esgoto de Luxo' : 'Escola de Jujutsu (No meio de uma aula chata)',
      chaosLevel: 10,
      npcRelationships: {} 
    };
    
    const updatedUser = { ...currentUser, character: char, worldState: initialWorld };
    setCharacter(char);
    saveUserData(updatedUser);
    setStage(GameStage.PLAYING);
  };

  const handleUpdateCharacter = (newChar: Character) => {
    if (!currentUser) return;
    setCharacter(newChar);
    saveUserData({ ...currentUser, character: newChar });
  };

  return (
    <div className="min-h-screen p-0 flex flex-col items-center justify-center">
      {stage === GameStage.AUTH && <AuthScreen onLogin={handleLogin} />}

      {stage === GameStage.START && (
        <div className="text-center space-y-12 max-w-2xl animate-in fade-in p-4">
          <div className="space-y-4">
            <h1 className="text-6xl sm:text-8xl font-bungee leading-none text-white italic">JUJUTSU <br/> <span className="text-purple-500">PARÓDIA</span></h1>
            <p className="text-sm font-marker text-white/40 italic">"Tente não morrer de vergonha alheia."</p>
          </div>
          <button onClick={() => setStage(GameStage.CHARACTER_CREATION)} className="w-full sm:w-80 py-6 bg-white text-black font-bungee rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-2xl text-xl">ENTRAR NO ROTEIRO</button>
        </div>
      )}

      {stage === GameStage.CHARACTER_CREATION && <CharacterCreation onComplete={handleCharComplete} />}

      {stage === GameStage.PLAYING && character && (
        <GameInterface 
          character={character} 
          updateCharacter={handleUpdateCharacter} 
          onPvP={() => setStage(GameStage.PVP_BATTLE)} 
          onGameOver={() => setStage(GameStage.GAMEOVER)}
        />
      )}

      {stage === GameStage.PVP_BATTLE && character && (
        <PvPInterface player={character} onExit={() => setStage(GameStage.PLAYING)} updatePlayer={handleUpdateCharacter} />
      )}

      {stage === GameStage.GAMEOVER && (
        <div className="max-w-xl w-full glass-panel p-16 rounded-[3rem] text-center space-y-10 border-2 border-red-600/30">
            <h2 className="text-6xl font-bungee text-red-600">DERROTA MÁXIMA</h2>
            <p className="text-xl font-marker text-white/70 italic">"Você virou um flashback triste de alguém."</p>
            <button onClick={() => setStage(GameStage.START)} className="w-full py-6 bg-white text-black font-bungee rounded-2xl hover:bg-red-600 transition-all">TENTAR OUTRO RECEPTÁCULO</button>
        </div>
      )}
    </div>
  );
};

export default App;
