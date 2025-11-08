import { GoogleGenAI, Type } from "@google/genai";

// FIX: Initialize GoogleGenAI directly with process.env.API_KEY and remove API_KEY checks
// per coding guidelines. Assume API_KEY is always available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // FIX: Removed API_KEY check per coding guidelines.
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
