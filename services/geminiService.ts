
import { GoogleGenAI, Type } from "@google/genai";
import { Character, GameMessage, WorldState, Item, ANIME_TIMELINE } from "../types";

const sanitizeForPrompt = (obj: any) => {
  if (!obj) return obj;
  const clone = JSON.parse(JSON.stringify(obj));
  const removeLargeFields = (target: any) => {
    if (typeof target !== 'object' || target === null) return;
    if (Array.isArray(target)) {
      target.forEach(removeLargeFields);
    } else {
      for (const key in target) {
        if (['imageUrl', 'profileImageUrl', 'iconUrl'].includes(key)) {
          target[key] = "[OMITTED]";
        } else if (typeof target[key] === 'object') {
          removeLargeFields(target[key]);
        }
      }
    }
  };
  removeLargeFields(clone);
  return clone;
};

export const generateSceneImage = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `JJK Anime style parody, colorful, funny, over-the-top character expressions, cinematic lighting: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : undefined;
};

export const generateCharacterProfile = async (appearance: string, name: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Funny and expressive JJK character portrait, anime style, iconic features: ${appearance}` }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : undefined;
};

export const generateNarrative = async (
  character: Character,
  history: GameMessage[],
  userInput: string,
  worldState: WorldState
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `
    VOCÊ É O NARRADOR DE UMA PARÓDIA CAÓTICA DE JUJUTSU KAISEN (ESTILO JUJUTSU STROLL / GINTAMA).
    
    PERSONALIDADE:
    - Sarcástico, quebra a quarta parede, faz bullying carinhoso com o jogador.
    - Se a ação for épica: Descreva como se fosse o momento mais importante do anime, mas com um toque ridículo.
    - Se a ação for burra: Descreva o fracasso de forma hilária, focando na vergonha alheia.
    - Chame o jogador de "Figurante" ou "O Cara do Roteiro" ocasionalmente.

    REGRAS DE HUMOR:
    - KOKUSEN (Black Flash) vira "KOKUSEN DE COMÉDIA" quando algo muito engraçado acontece.
    - O "Nível de Caos" do mundo aumenta se o jogador fizer piadas ou ações absurdas.

    JSON OBRIGATÓRIO:
    {
      "narrative": "Texto engraçado e sarcástico narrando a ação...",
      "imagePrompt": "Prompt visual bizarro e colorido para a cena.",
      "actionEvaluation": { "status": "ACERTO"|"ERRO"|"CRÍTICO"|"VERGONHA_ALHEIA", "damageDealt": n, "qiCost": n },
      "kokusen": boolean,
      "chaosIncrease": n,
      "npcUpdate": { "name": "...", "affinityDelta": n, "newStatus": "...", "location": "...", "isAlive": boolean },
      "interventionOccurred": "Nome do NPC fazendo algo ridículo",
      "xpGain": n,
      "hpChange": n,
      "suggestions": ["Ação Sóbria", "Ação Tática", "Ação Completamente Idiota"]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: { 
      parts: [
        { text: `JOGADOR: ${character.name} (Motivação: ${character.motivation})` },
        { text: `ESTADO: ${JSON.stringify(sanitizeForPrompt(character))}` },
        { text: `HISTÓRICO: ${JSON.stringify(sanitizeForPrompt(history.slice(-3)))}` },
        { text: `NÍVEL DE CAOS ATUAL: ${worldState.chaosLevel}` },
        { text: `AÇÃO DO JOGADOR: ${userInput}` }
      ] 
    },
    config: { systemInstruction, responseMimeType: "application/json" }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    return { 
      narrative: "Até eu, o narrador, perdi as palavras com essa sua burrice. Parabéns.", 
      suggestions: ["Tentar de novo", "Chorar no banho"],
      actionEvaluation: { status: 'ERRO', damageDealt: 0, qiCost: 10 }
    };
  }
};
