import bcrypt from "bcryptjs";

export async function verifyYiiPassword(password: string, hash: string | null | undefined) {
  if (!hash) return false;

  // Yii/PHP commonly stores bcrypt hashes with the $2y$ prefix. bcryptjs verifies
  // the same hash body when normalized to the broadly supported $2b$ prefix.
  const normalizedHash = hash.startsWith("$2y$") ? `$2b$${hash.slice(4)}` : hash;
  return bcrypt.compare(password, normalizedHash);
}
