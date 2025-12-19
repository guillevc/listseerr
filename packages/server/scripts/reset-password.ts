import { eq } from 'drizzle-orm';
import { db, sqlite } from '../src/infrastructure/db/client';
import { users } from '../src/infrastructure/db/schema';

function generatePassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function main() {
  const username = process.argv[2];

  // Find user (use arg or default to first user)
  const [user] = username
    ? await db.select().from(users).where(eq(users.username, username)).limit(1)
    : await db.select().from(users).limit(1);

  if (!user) {
    console.error(username ? `User "${username}" not found` : 'No users found in database');
    process.exit(1);
  }

  // Generate and hash new password
  const newPassword = generatePassword();
  const hash = await Bun.password.hash(newPassword, { algorithm: 'bcrypt', cost: 10 });

  // Update password
  await db.update(users).set({ passwordHash: hash }).where(eq(users.id, user.id));

  console.log('Password reset successful!');
  console.log(`Username: ${user.username}`);
  console.log(`New password: ${newPassword}`);

  sqlite.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('Password reset failed:', error);
  sqlite.close();
  process.exit(1);
});
