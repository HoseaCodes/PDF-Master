import CredentialsProvider from 'next-auth/providers/credentials';

const baseURL = process.env.NEXT_PUBLIC_HOSTNAME + "login";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const requestBody = {
            email: credentials.email,
            password: credentials.password,
          };
          const res = await fetch(baseURL, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: { "Content-Type": "application/json" },
          });
          const resdata = await res.json();
          console.log("Login...", resdata);
          if (
            resdata.status === 400 ||
            resdata.status === 401 ||
            resdata.status === 403 ||
            resdata.status === 500
          ) {
            return null;
          }
          if (resdata.status === 200 || resdata.status === 201) {
            return resdata;
          }
          // Return null if user data could not be retrieved
          return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    // signIn: '/auth/signin',
    // signUp: '/auth/signup',
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};
