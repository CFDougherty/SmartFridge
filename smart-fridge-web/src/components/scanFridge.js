const OPENAI_API_KEY = "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";
const GPT_VISION_API_URL = "https://api.openai.com/v1/chat/completions";

export async function scanFridge() {
    try {
        const CAMERA_URL = "http://picam.local:5000/image.jpg";
        const response = await fetch(CAMERA_URL);
        if (!response.ok) throw new Error("Failed to fetch image from camera");

        const imageBlob = await response.blob();
        const base64Image = await convertToBase64(imageBlob);
        if (!base64Image) throw new Error("Failed to convert image to Base64");

        const payload = {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an AI that identifies groceries from images and returns a JSON list."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Identify and list groceries in this image in JSON format. The root key should be titled 'inventory' and contain objects with 'name', 'count', and 'unit'."
                        },
                        {
                            type: "image_url",
                            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
                        }
                    ]
                }
            ],
            max_tokens: 500
        };

        const openaiResponse = await fetch(GPT_VISION_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!openaiResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
        }

        const responseData = await openaiResponse.json();
        let detectedItems = responseData?.choices?.[0]?.message?.content || "{}";

        try {
            return JSON.parse(detectedItems);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return { error: "Invalid JSON response from OpenAI" };
        }
    } catch (error) {
        console.error("Error scanning fridge:", error);
        return { error: error.message };
    }
}

async function convertToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
