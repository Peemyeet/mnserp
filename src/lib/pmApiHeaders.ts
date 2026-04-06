/**
 * ใช้แนบกับ fetch ไปยัง API project manager เมื่อมี access token จากการล็อกอิน
 */
export function pmAuthorizationHeader(
  accessToken: string | undefined
): Record<string, string> {
  if (!accessToken?.trim()) {
    return {};
  }
  return { Authorization: `Bearer ${accessToken.trim()}` };
}
