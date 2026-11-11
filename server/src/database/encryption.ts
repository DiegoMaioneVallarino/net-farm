import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;

  if (!raw || !/^[a-fA-F0-9]{64}$/.test(raw)) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY debe contener 64 caracteres hexadecimales"
    );
  }

  return Buffer.from(raw, "hex");
}

export function encryptToken(token: string): string {
  const iv = randomBytes(12);

  const cipher = createCipheriv(
    "aes-256-gcm",
    getKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptToken(value: string): string {
  const [version, ivHex, tagHex, dataHex] =
    value.split(":");

  if (version !== "v1" || !ivHex || !tagHex || !dataHex) {
    throw new Error("Formato de token cifrado inválido");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}