import { Token, IToken } from '../models/Token';

export async function createResetToken(userId: string, hashedToken: string, sessionId: string, expiresAt: number): Promise<IToken> {
  const token = new Token({ userId, token: hashedToken, sessionId, expiresAt });
  return token.save();
}

export async function findValidResetToken(hashedToken: string): Promise<IToken | null> {
  return Token.findOne({ token: hashedToken, expiresAt: { $gt: Date.now() } });
}

export async function deleteResetToken(tokenId: string): Promise<void> {
  await Token.deleteOne({ _id: tokenId });
}
