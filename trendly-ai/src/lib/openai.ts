import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using gemini-2.5-flash-preview-05-20 as specified, but keeping OpenAI for now
        messages: [
          {
            role: 'system',
            content: `You are an expert social media content creator specializing in TikTok trends. Generate engaging, authentic, and trend-aware content that resonates with Gen Z and millennial audiences. Always respond with valid JSON format.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content generated')
      }

      // Parse the JSON response
      const parsedContent = JSON.parse(content) as ContentGenerationResponse

      // Validate the response structure
      if (!this.validateResponse(parsedContent, types)) {
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