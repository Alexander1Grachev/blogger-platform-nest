
export function generateBasicAuthToken(): string {
  const credentials = `${process.env.BASIC_AUTH_USERNAME}:${process.env.BASIC_AUTH_PASSWORD}`;

  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

