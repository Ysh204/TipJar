import { prismaClient } from "../index";

type ParsedArgs = {
  email?: string;
  password?: string;
  phone?: string;
  displayName?: string;
};

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--email" && next) {
      parsed.email = next;
      i += 1;
      continue;
    }

    if (arg === "--password" && next) {
      parsed.password = next;
      i += 1;
      continue;
    }

    if (arg === "--phone" && next) {
      parsed.phone = next;
      i += 1;
      continue;
    }

    if (arg === "--display-name" && next) {
      parsed.displayName = next;
      i += 1;
    }
  }

  return parsed;
}

function printUsage() {
  console.error(
    "Usage: bun run create-admin --email admin@example.com --password password123 --phone 1234567890 [--display-name \"Admin\"]"
  );
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed.email || !parsed.password || !parsed.phone) {
    printUsage();
    process.exit(1);
  }

  const email = parsed.email;
  const password = parsed.password;
  const phone = parsed.phone;
  const displayName = parsed.displayName;

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  if (phone.length < 7 || phone.length > 15) {
    console.error("Phone must be between 7 and 15 characters.");
    process.exit(1);
  }

  const existingUser = await prismaClient.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  if (existingUser) {
    const duplicateField = existingUser.email === email ? "email" : "phone";
    console.error(`A user with that ${duplicateField} already exists.`);
    console.error(JSON.stringify(existingUser, null, 2));
    process.exit(1);
  }

  const user = await prismaClient.user.create({
    data: {
      email,
      password,
      phone,
      role: "ADMIN",
      displayName: displayName || email.split("@")[0],
    },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      displayName: true,
    },
  });

  console.log("Admin created successfully:");
  console.log(JSON.stringify(user, null, 2));
}

try {
  await main();
} finally {
  await prismaClient.$disconnect();
}
