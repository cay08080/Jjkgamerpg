
import { GoogleGenAI, Type } from "@google/genai";
import { Character, GameMessage, WorldState } from "../types";

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
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Anime style JJK parody, funny, expressive characters, cinematic lighting: ${prompt}` }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : undefined;
  } catch (e) {
    console.error("Erro ao gerar imagem:", e);
    return undefined;
  }
};

export const generateCharacterProfile = async (appearance: string, name: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Funny anime character portrait JJK style, iconic look: ${appearance}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : undefined;
  } catch (e) {
    return undefined;
  }
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
    VOCÊ É O NARRADOR DE UMA PARÓDIA CAÓTICA DE JUJUTSU KAISEN.
    
    ESTILO: Sarcástico, quebra a quarta parede (meta-humor), ácido e hilário.
    OBJETIVO: Transformar o sofrimento do mundo JJK em situações de comédia absurda.
    
    REGRAS:
    - KOKUSEN (Black Flash) vira "Kokusen de Comédia" e acontece quando a ação é ridícula demais ou épica de um jeito idiota.
    - Se o jogador errar, descreva o fracasso focando na vergonha alheia.
    - Intervenções de NPCs: NPCs do anime podem aparecer só para fazer comentários sarcásticos.
    
    RETORNE SEMPRE UM JSON NESTE FORMATO:
    {
      "narrative": "Texto da narração com humor ácido...",
      "imagePrompt": "Prompt visual detalhado (estilo paródia colorida)...",
      "actionEvaluation": { "status": "ACERTO"|"ERRO"|"CRÍTICO"|"VERGONHA_ALHEIA", "damageDealt": n, "qiCost": n },
      "kokusen": boolean,
      "chaosIncrease": n,
      "hpChange": n,
      "xpGain": n,
      "interventionOccurred": "Nome do NPC (ou null)",
      "suggestions": ["Ação Sóbria", "Ação Tática", "Ação Completamente Maluca"]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: { 
      parts: [
        { text: `JOGADOR: ${character.name} (Técnica: ${character.technique})` },
        { text: `CONTEXTO ATUAL: ${worldState.currentLocation}, Caos: ${worldState.chaosLevel}%` },
        { text: `HISTÓRICO: ${JSON.stringify(sanitizeForPrompt(history.slice(-2)))}` },
        { text: `AÇÃO DO JOGADOR: ${userInput}` }
      ] 
    },
    config: { systemInstruction, responseMimeType: "application/json" }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { 
      narrative: "A realidade quebrou porque você foi idiota demais. Parabéns.", 
      suggestions: ["Tentar consertar o universo", "Chorar"],
      actionEvaluation: { status: "ERRO", damageDealt: 0, qiCost: 5 }
    };
  }
};

export const arbitratePvP = async (p1: Character, p2: Character, p1Action: string, p2Action: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `
    ARBITRO DE LUTA JJK (VERSÃO PARÓDIA).
    Narração visceral, mas focada no humor da colisão de poderes.
    
    RETORNE JSON:
    {
      "narrative": "string",
      "p1Damage": number,
      "p1QiCost": number,
      "p2Damage": number,
      "p2QiCost": number,
      "kokusen": boolean
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: `P1 (${p1.name}): ${p1Action} | P2 (${p2.name}): ${p2Action}` }]
    },
    config: { systemInstruction, responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};
