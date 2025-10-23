
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // Em um ambiente real, você poderia desabilitar as features de IA se a chave não estiver presente.
  console.warn("API Key do Gemini não encontrada. As funcionalidades de IA estarão desabilitadas.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        categoria: {
            type: Type.STRING,
            description: 'Uma categoria adequada para o insumo. Exemplos: Grãos, Laticínios, Limpeza, Escritório, Hortifruti.'
        },
        unidade: {
            type: Type.STRING,
            description: 'A unidade de medida mais comum para este insumo. Exemplos: kg, g, L, ml, unidade(s), caixa(s), pacote(s).'
        },
    },
    required: ['categoria', 'unidade']
};

export const suggestItemDetails = async (itemName: string): Promise<{ categoria: string, unidade: string }> => {
    if (!API_KEY) {
        return Promise.reject(new Error("API Key do Gemini não configurada."));
    }
    
    try {
        const prompt = `Para o insumo de estoque chamado "${itemName}", sugira a melhor categoria e unidade de medida. Responda em português do Brasil.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const suggestion = JSON.parse(jsonText);
        
        return suggestion;
    } catch (error) {
        console.error("Erro ao chamar a API do Gemini:", error);
        throw new Error("Não foi possível obter sugestões da IA. Tente novamente.");
    }
};
