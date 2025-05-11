import { createYoga } from 'graphql-yoga';
import { schema } from './schema';

// 创建yoga实例
const yoga = createYoga({
  schema,
  graphiql: true,
  context: ({ request, env, ctx }) => {
    // 添加日志以检查 env 是否存在
    console.log('Context env:', env ? 'exists' : 'undefined');
    console.log('Available env keys:', env ? Object.keys(env) : 'none');
    
    return { 
      request, 
      env,
      ctx 
    };
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// 导出Worker处理函数
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // 添加日志以检查传入的 env 对象
    console.log('Worker env:', env ? 'exists' : 'undefined');
    console.log('Worker env keys:', env ? Object.keys(env) : 'none');
    return yoga.fetch(request, env, ctx);
  }
};