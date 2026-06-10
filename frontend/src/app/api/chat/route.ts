import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const session = await getServerSession(authOptions);

  const userName = session?.user?.name || "un usuario anónimo";
  const userRoles = session?.user?.roles ? session.user.roles.join(', ') : "sin roles específicos";
  
  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: `Eres el asistente inteligente de CuadernoFP. Estás hablando con ${userName}, quien tiene los siguientes roles: ${userRoles}. Responde de forma amable, clara y concisa. Ayuda al usuario en sus dudas.`,
    messages,
  });

  return result.toDataStreamResponse();
}
