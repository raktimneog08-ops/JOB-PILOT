import { NextResponse } from 'next/server';

export async function GET(request) {
  const tokenCookie = request.cookies.get('session_token');

  if (tokenCookie && tokenCookie.value) {
    try {
      // Decode mock token info
      const tokenVal = tokenCookie.value;
      const base64Data = tokenVal.replace('token_', '');
      const data = JSON.parse(Buffer.from(base64Data, 'base64').toString('ascii'));

      // Check expiry
      if (Date.now() < data.exp) {
        return NextResponse.json({
          authenticated: true,
          user: { name: 'Admin User', role: data.user },
          token: tokenVal
        });
      }
    } catch (e) {
      // Decode error
    }
  }

  // Unauthorized response
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
