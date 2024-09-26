export async function POST(request) {
    try {
        const { message } = await request.json();

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
        }

        const apiKey = process.env.AZURE_OPENAI_API_KEY; // Ensure this is correctly set
        const apiEndpoint = 'https://Phi-3-mini-4k-instruct-ofzim.swedencentral.models.ai.azure.com/chat/completions'; // Replace with your actual endpoint

        // Construct the request payload
        const payload = {
            model: 'Phi-3-mini-4k-instruct', // Include the model parameter
            messages: [
                {
                    role: 'system',
                    content: 'You are an assistant that categorizes messages into sentiments: angry, excited, happy, or sad. Return only the answer as a single word.',
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
            max_tokens: 100,
            temperature: 0.0,
        };

        const body = JSON.stringify(payload);

        // Log the request details for debugging
        console.log('--- API Request ---');
        console.log('Endpoint:', apiEndpoint);
        console.log('Headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`, // Updated header
        });
        console.log('Payload:', body);
        console.log('-------------------');

        // Make the API request
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`, // Updated header
            },
            body: body,
        });

        // Log the response status
        console.log('API Response Status:', response.status);

        // Parse the JSON response
        const data = await response.json();

        // Log the response data
        console.log('API Response Data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            // If the API returned an error
            const errorMessage = data.error?.message || 'Invalid response from API';
            return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
        }

        // Extract the sentiment from the response
        const sentiment = data.choices[0].message?.content?.trim().toLowerCase();
        const validSentiments = ['angry', 'excited', 'happy', 'sad'];

        if (!validSentiments.includes(sentiment)) {
            return new Response(JSON.stringify({ error: `Invalid sentiment returned: ${sentiment}` }), { status: 400 });
        }

        return new Response(JSON.stringify({ sentiment }), { status: 200 });
    } catch (error) {
        console.error('Error categorizing message:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
