export const encodeOrderCode = (orderCode: string): string => {
  return Buffer.from(orderCode).toString('base64url'); 
};
export const decodeOrderCode = (token: string): string | null => {
  try {
    return Buffer.from(token, 'base64url').toString('utf8');
  } catch {
    return null;
  }
};