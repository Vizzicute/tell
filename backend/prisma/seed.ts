// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create some users
  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      image: "https://i.pravatar.cc/150?img=1",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob",
      image: "https://i.pravatar.cc/150?img=2",
    },
  });

  // Create a chat between Alice and Bob
  const chat = await prisma.chat.create({
    data: {
      participants: {
        connect: [{ id: alice.id }, { id: bob.id }],
      },
    },
  });

  // Create messages in that chat
  const message1 = await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId: alice.id,
      text: "Hey Bob, how's it going?",
    },
  });

  const message2 = await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId: bob.id,
      text: "Hi Alice! Doing great, you?",
    },
  });

  // Update chat with last message info
  await prisma.chat.update({
    where: { id: chat.id },
    data: {
      lastMessageId: message2.id,
      lastMessageAt: message2.createdAt,
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
