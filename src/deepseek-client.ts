export interface DeepSeekResponse {
  id: string;
  content: string;
  finish_reason?: string;
}

export class DeepSeekClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.deepseek.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey

    if (!apiKey || apiKey === 'your-deepseek-api-key') {
      throw new Error('无效的DeepSeek API密钥');
    }

  }

  async generateText(prompt: string): Promise<DeepSeekResponse> {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('提示词不能为空');
    }

    try {
      console.log(`正在发送请求到DeepSeek API，提示词: "${prompt.substring(0, 30)}..."`);

      const url = `${this.baseUrl}/chat/completions`;
      
      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      const responseText = await response.text();
      const completion =  JSON.parse(responseText);

      // 确保有响应内容
      if (!completion.choices || completion.choices.length === 0) {
        throw new Error('DeepSeek API返回了空响应');
      }

      const responseMessage = completion.choices[0].message;
      
      return {
        id: completion.id,
        content: responseMessage.content || '',
        finish_reason: completion.choices[0].finish_reason
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`DeepSeek API错误 (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`调用DeepSeek API时发生错误: ${error.message}`);
    }
  }
}