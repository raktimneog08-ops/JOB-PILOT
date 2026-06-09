import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Standard credential check for local test purposes
    if (username === 'admin' && password === 'admin123') {
      const mockToken = `token_${Buffer.from(JSON.stringify({ user: 'admin', exp: Date.now() + 2 * 60 * 60 * 1000 })).toString('base64')}`;

      const response = NextResponse.json({ success: true, user: { name: 'Admin User', role: 'admin' } });
      
      // Set HttpOnly secure cookie for session validation
      response.cookies.set('session_token', mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 2 // 2 hours
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
