const prisma = new PrismaClient()

async function main() {
  const newAssistant = await prisma.assistant.create({
    data: { assistantId: "asst_LfNiFusBqickZEueJfCOcbos" },
  })
  console.log(newAssistant)
}

main()
  .catch((e) => {
    console.log(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
