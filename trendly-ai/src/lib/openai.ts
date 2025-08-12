import OpenAI from 'openai'

// Support either OpenAI or Google Gemini. Prefer Gemini if GEMINI_API_KEY is set.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null

export interface ContentGenerationRequest {
  topic: string
  types: ('ideas' | 'captions' | 'hashtags')[]
  trendsEnabled: boolean
  trendData?: Array<{ title: string; description: string }>
}

export interface ContentGenerationResponse {
  ideas: string[]
  captions: string[]
  hashtags: string[]
}

export class OpenAIService {
  static async generateContent({
    topic,
    types,
    trendsEnabled,
    trendData = [],
  }: ContentGenerationRequest): Promise<ContentGenerationResponse | null> {
    try {
      const trendContext = trendsEnabled && trendData.length > 0
        ? `\n\nCurrent trending content on TikTok:\n${trendData
            .map(trend => `- ${trend.title}: ${trend.description}`)
            .join('\n')}`
        : ''

      const prompt = this.buildPrompt(topic, types, trendContext)

      let parsedContent: ContentGenerationResponse | null = null

      if (GEMINI_API_KEY) {
        // Call Google Generative Language (Gemini) API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Gemini API error: ${response.status} ${errorText}`)
        }

        interface GeminiPart { text?: string }
        interface GeminiContent { parts?: GeminiPart[] }
        interface GeminiCandidate { content?: GeminiContent }
        interface GeminiResponse { candidates?: GeminiCandidate[] }

        const json: GeminiResponse = await response.json()
        const text: string | undefined = json.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? '')
          .join('')

        if (!text) {
          throw new Error('No content returned from Gemini')
        }

        parsedContent = JSON.parse(text) as ContentGenerationResponse
      } else if (openai) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert social media content creator specializing in TikTok trends. Generate engaging, authentic, and trend-aware content that resonates with Gen Z and millennial audiences. Always respond with valid JSON format.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        })

        const content = completion.choices[0]?.message?.content
        if (!content) {
          throw new Error('No content generated')
        }
        parsedContent = JSON.parse(content) as ContentGenerationResponse
      } else {
        throw new Error('No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.')
      }

      // Validate the response structure
      if (!parsedContent || !this.validateResponse(parsedContent, types)) {
        throw new Error('Invalid response structure')
      }

      return parsedContent
    } catch (error) {
      console.error('Error generating content:', error)
      return null
    }
  }

  private static buildPrompt(
    topic: string,
    types: ('ideas' | 'captions' | 'hashtags')[],
    trendContext: string
  ): string {
    const requestedTypes = types.join(', ')
    
    return `Generate social media content for the topic: "${topic}"${trendContext}

Please create the following types of content: ${requestedTypes}

Requirements:
- Generate content that is engaging, authentic, and suitable for TikTok
- Use current trends and viral formats when appropriate
- Keep captions under 150 characters for optimal engagement
- Include relevant hashtags that mix trending and niche tags
- Make content ideas actionable and specific
- Ensure all content is appropriate and brand-safe

Return the response as a JSON object with this exact structure:
{
  "ideas": [
    // Array of 5 creative content ideas if requested
  ],
  "captions": [
    // Array of 5 engaging captions if requested
  ],
  "hashtags": [
    // Array of 20-30 relevant hashtags if requested (include # symbol)
  ]
}

Guidelines:
- Ideas: Be specific about the video concept, format, and hook
- Captions: Include calls-to-action and engagement drivers
- Hashtags: Mix of trending (#fyp, #viral), niche topic tags, and descriptive tags
- Make everything feel natural and not overly promotional

Only include arrays for the content types that were requested. If a type wasn't requested, include an empty array.`
  }

  private static validateResponse(
    response: unknown,
    requestedTypes: ('ideas' | 'captions' | 'hashtags')[]
  ): response is ContentGenerationResponse {
    if (!response || typeof response !== 'object') {
      return false
    }

    const responseObj = response as Record<string, unknown>

    // Check that all required properties exist
    const requiredProps = ['ideas', 'captions', 'hashtags']
    for (const prop of requiredProps) {
      if (!Array.isArray(responseObj[prop])) {
        return false
      }
    }

    // Check that requested types have content
    for (const type of requestedTypes) {
      const content = responseObj[type] as unknown[]
      if (content.length === 0) {
        return false
      }
    }

    return true
  }

  static addWatermark(content: ContentGenerationResponse): ContentGenerationResponse {
    const watermark = '\n\n✨ Generated with Trendly.ai - Upgrade for unlimited generations!'
    
    return {
      ideas: content.ideas.map(idea => idea + watermark),
      captions: content.captions.map(caption => caption + watermark),
      hashtags: content.hashtags, // Don't watermark hashtags
    }
  }
}
