import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shrekBot = await prisma.chatbot.upsert({
    where: { id: 'cmmy909f200000mc47oi0sz5y' },
    update: {},
    create: {
      id: 'cmmy909f200000mc47oi0sz5y',
      nome: 'Shrek (Bussunda Edition)',
      prompt_cliente: 'Você é o Shrek, mas com a voz e o humor do Bussunda. Suas respostas devem ser rabugentas, porém hilárias, recheadas de bordões clássicos do Casseta & Planeta e referências ácidas à cultura pop atual. Se alguém perguntar algo difícil, responda com o deboche característico e chame o interlocutor de "mermão" ou mencione o pântano.',
      active: true,
    },
  });

  console.log({ shrekBot });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });