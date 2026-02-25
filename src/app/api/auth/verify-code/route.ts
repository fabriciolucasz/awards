import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importa a instância centralizada!

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code, cpf, name, email } = body;

    if (!phone || !code) {
      return NextResponse.json({ error: 'Telefone e código são obrigatórios' }, { status: 400 });
    }

    // 1. Procurar o código na base de dados
    const verification = await prisma.verificationCode.findFirst({
      where: {
        phone: phone,
        code: code,
      },
    });

    // 2. Validações de segurança
    if (!verification) {
      return NextResponse.json({ error: 'Código inválido ou incorreto' }, { status: 400 });
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json({ error: 'Este código já expirou. Solicite um novo.' }, { status: 400 });
    }

    // 3. O código é válido! Vamos apagá-lo para que não seja usado 2 vezes
    await prisma.verificationCode.delete({
      where: { id: verification.id }
    });

    // 4. Procurar o cliente ou criá-lo (Registo/Login automático)
    let client = await prisma.client.findUnique({
      where: { cpf: cpf }
    });

    // Se o cliente não existir e enviou os dados de registo (name, email), criamos agora
    if (!client && name && cpf) {
      client = await prisma.client.create({
        data: {
          name,
          cpf,
          phone,
          email: email || `${cpf}@naoinformado.com`, // Fallback se não tiver email
        }
      });
    }

    // Retornamos os dados do cliente (numa aplicação real maior, aqui devolverias um token JWT num cookie HttpOnly)
    return NextResponse.json({
      success: true,
      message: 'Autenticação bem-sucedida',
      user: client
    });

  } catch (error) {
    console.error('Erro na API de Verify Code:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}