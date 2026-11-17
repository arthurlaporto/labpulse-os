import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  BACKEND: DurableObjectNamespace<Backend>;
  DATABASE_URL: string;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_SENHA: string;
  ADMIN_NOME: string;
  FRONTEND_URL: string;
}

export class Backend extends Container<Env> {
  defaultPort = 8080; // a porta em que o NestJS escuta
  sleepAfter = "30m"; // desliga depois de 30 minutos sem uso

  constructor(ctx: ConstructorParameters<typeof Container>[0], env: Env) {
    super(ctx, env);
    this.envVars = {
      PORT: "8080",
      DATABASE_URL: env.DATABASE_URL,
      JWT_SECRET: env.JWT_SECRET,
      ADMIN_EMAIL: env.ADMIN_EMAIL,
      ADMIN_SENHA: env.ADMIN_SENHA,
      ADMIN_NOME: env.ADMIN_NOME,
      FRONTEND_URL: env.FRONTEND_URL,
    };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = getContainer(env.BACKEND);
    return container.fetch(request);
  },
};
