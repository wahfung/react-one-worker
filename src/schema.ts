import { makeExecutableSchema } from '@graphql-tools/schema';
import { DeepSeekClient } from './deepseek-client';

// 定义GraphQL schema
const typeDefs = `#graphql
  type Location {
    id: ID!
    name: String!
    description: String!
    photo: String
  }

  type GenerationResponse {
    id: String!
    content: String!
    finishReason: String
  }

  type Query {
    locations: [Location!]!
    generateText(prompt: String!): GenerationResponse
  }
`;

// 创建示例位置数据
const locations = [
  {
    id: "1",
    name: "上海东方明珠",
    description: "上海地标性建筑，位于浦东新区陆家嘴，是上海的象征之一。",
    photo: "https://example.com/pearl-tower.jpg"
  },
  {
    id: "2",
    name: "北京故宫",
    description: "中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。",
    photo: "https://example.com/forbidden-city.jpg"
  },
  {
    id: "3",
    name: "杭州西湖",
    description: "中国浙江省杭州市的著名风景区，被誉为人间天堂。",
    photo: "https://example.com/west-lake.jpg"
  }
];

const resolvers = {
  Query: {
    locations: () => locations,
    generateText: async (_: any, { prompt }: { prompt: string }, context: any) => {
      // 获取API密钥，提供多种备选方案
      let apiKey = null;
      
      // 尝试从context.env获取
      if (context?.env?.DEEPSEEK_API_KEY) {
        apiKey = context.env.DEEPSEEK_API_KEY;
        console.log('Using API key from context.env');
      } 
      // 尝试从context本身获取（如果env被展开到context中）
      else if (context?.DEEPSEEK_API_KEY) {
        apiKey = context.DEEPSEEK_API_KEY;
        console.log('Using API key from context directly');
      }
      // 使用环境变量
      else if (typeof process !== 'undefined' && process.env?.DEEPSEEK_API_KEY) {
        apiKey = process.env.DEEPSEEK_API_KEY;
        console.log('Using API key from process.env');
      }
      
      if (!apiKey) {
        throw new Error('服务器配置错误: 缺少API密钥，请检查环境变量配置');
      }
      
      try {
        const client = new DeepSeekClient(apiKey);
        const response = await client.generateText(prompt);
        return {
          id: response.id,
          content: response.content,
          finishReason: response.finish_reason
        };
      } catch (error) {
        throw new Error(`文本生成失败: ${error.message}`);
      }
    }
  }
};

// 创建可执行的schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});