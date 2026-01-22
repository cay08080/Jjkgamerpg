
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
    setCharacter(char);
    const updatedUser = { ...currentUser, character: char };
    saveUserData(updatedUser);
    setStage(GameStage.PLAYING);
  };

  const handleUpdateCharacter = (newChar: Character) => {
    if (!currentUser) return;
    setCharacter(newChar);
    saveUserData({ ...currentUser, character: newChar });
  };

  return (
    <div className="min-h-screen p-0 flex flex-col items-center justify-center bg-[#050508] text-white">
      {stage === GameStage.AUTH && <AuthScreen onLogin={handleLogin} />}

      {stage === GameStage.START && (
        <div className="text-center space-y-12 max-w-2xl animate-in fade-in p-4">
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-8xl font-bungee leading-none tracking-tighter">JUJUTSU <br/> <span className="text-purple-500">PARÓDIA</span></h1>
            <p className="text-xs font-mono text-white/30 tracking-[0.5em] uppercase">O RPG mais disfuncional da fenda temporal</p>
          </div>
          <div className="p-8 glass-panel rounded-3xl border border-white/5 space-y-6">
            <p className="font-marker text-xl text-white/70 italic">"Coma dedos, chore em flashbacks e tente não ser cancelado pelas maldições."</p>
            <button onClick={() => setStage(GameStage.CHARACTER_CREATION)} className="w-full py-6 bg-white text-black font-bungee rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-2xl text-xl tracking-widest">ASSINAR O ROTEIRO</button>
          </div>
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
            <h2 className="text-6xl font-bungee text-red-600 italic">MORTE (MEME)</h2>
            <p className="text-xl font-marker text-white/80 italic">"Você virou figurante de fundo. O Gege Akutami finalmente te pegou."</p>
            <button onClick={() => setStage(GameStage.START)} className="w-full py-6 bg-white text-black font-bungee rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-2xl">REENCARNAR COMO FIGURANTE</button>
        </div>
      )}
    </div>
  );
};

export default App;
