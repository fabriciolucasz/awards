import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importa a instância centralizada!

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, cpf, name } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 });
    }

    // 1. Limpar códigos antigos deste número para evitar spam/confusão
    await prisma.verificationCode.deleteMany({
      where: { phone: phone }
    });

    // 2. Gerar código de 6 dígitos (ex: "482910")
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Definir expiração (5 minutos a partir de agora)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 4. Salvar na base de dados
    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        expiresAt,
      }
    });

    // 5. Aqui entraria a API da Zenvia/Twilio para enviar o SMS real.
    // Como estamos em desenvolvimento, vamos apenas imprimir no console:
    console.log(`\n📲 [SIMULAÇÃO DE SMS]`);
    console.log(`Para: ${phone}`);
    console.log(`Mensagem: O teu codigo Sav Awards e: ${code}\n`);

    // 6. Verificar se o cliente já existe (se não existir, podemos criar ou atualizar os dados depois)
    const existingClient = await prisma.client.findUnique({ where: { cpf } });

    return NextResponse.json({
      success: true,
      message: 'Código enviado com sucesso',
      isNewUser: !existingClient
    });

  } catch (error) {
    console.error('Erro na API de Request Code:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}