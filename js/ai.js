// AI module using OpenRouter free models

// Free working models as of 2025
const FREE_MODELS = [
    'google/gemma-3-27b:free',
    'qwen/qwen-2.5-vl-32b:free',
    'mistralai/mistral-7b-instruct:free'
];

export const AI = {
    async analyzeBottle(base64Image) {
        const apiKey = Storage.getAPIKey();
        if (!apiKey) {
            throw new Error('API key not set. Please configure in settings.');
        }

        // Use qwen2.5-vl which understands images
        const model = 'qwen/qwen-2.5-vl-32b:free';

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com',
                'X-Title': 'Hydration Love Tracker'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Look at this water bottle photo. Estimate what percentage of the bottle is filled with water. Respond with ONLY a number between 0 and 100. Do not include any other text.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: base64Image,
                                    detail: 'low'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 10,
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Extract number from response
        const match = content.match(/(\d+(?:\.\d+)?)/);
        if (!match) {
            throw new Error('Could not parse AI response');
        }

        const percentage = parseFloat(match[1]);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            throw new Error('Invalid percentage from AI');
        }

        // Convert to oz (16.9 oz bottle)
        const ozAmount = Math.round((percentage / 100) * 16.9 * 10) / 10;
        return {
            percentage,
            ozAmount: Math.max(0, Math.min(16.9, ozAmount)),
            model: data.model
        };
    },

    async quickEstimate(base64Image) {
        // Fallback: if AI fails, use a simple heuristic based on file size or a default
        // In production, we could integrate a tiny local ML model
        return { percentage: 50, ozAmount: 8.45, model: 'fallback' };
    }
};
