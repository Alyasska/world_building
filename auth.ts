import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

function getConfiguredUsername() {
  return process.env.AUTH_USERNAME ?? 'admin';
}

function getConfiguredPassword() {
  return process.env.AUTH_PASSWORD ?? 'admin';
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize(credentials) {
        const username = typeof credentials?.username === 'string' ? credentials.username : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';

        if (!username || !password) {
          return null;
        }

        if (username !== getConfiguredUsername() || password !== getConfiguredPassword()) {
          return null;
        }

        return {
          id: 'single-user',
          name: 'World Builder',
        };
      },
    }),
  ],
});
