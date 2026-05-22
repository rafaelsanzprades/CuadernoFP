const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@educa.aragon.es';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Administrador CDD',
        email: adminEmail,
        password: 'admin', // En prod, hashear
        roles: 'Superadmin,Profesorado',
      },
    });
    console.log('Usuario administrador creado con éxito: admin@educa.aragon.es / admin');
  } else {
    console.log('El usuario administrador ya existe.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
