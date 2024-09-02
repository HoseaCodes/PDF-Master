"use client"
import Link from 'next/link';
import MaxWidthWrapper from './maxwidthwapper';
import { buttonVariants } from './ui/button';
// import {
//   LoginLink,
//   RegisterLink,
//   getKindeServerSession,
// } from '@kinde-oss/kinde-auth-nextjs/server';
import { ArrowRight } from 'lucide-react';
import UserAccountNav from './useraccountnav';
import MobileNav from './mobilenav';
import { useSession, signOut, signIn } from 'next-auth/react';

const Navbar = () => {
  //   const { getUser } = getKindeServerSession();
  const getUser = () => { };
  const user = getUser();
  const { data: session } = useSession();
  console.log(session);

  return (
    <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
          <Link
            href='/'
            className='flex z-40 font-semibold'>
            <span>PDF Master.</span>
          </Link>

          <MobileNav isAuth={!!user} />

          <div className='hidden items-center space-x-4 sm:flex'>
            {!user ? (
              <>
                {session ? (
                  <>
                    <p>Welcome, {session.data.email}</p>
                    <button onClick={() => signOut()}>Sign Out</button>
                  </>
                ) : (
                  <>
                    <div className={buttonVariants({
                      variant: 'ghost',
                      size: 'sm',
                    })} href='/api/auth/signin'>Sign in</div>
                    <Link
                      href='/pricing'
                      className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                      })}>
                      Pricing
                    </Link>
                    <div className={buttonVariants({
                      variant: 'ghost',
                      size: 'sm',
                    })} href='/api/auth/signup'>Get started</div>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  href='/dashboard'
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                  Dashboard
                </Link>

                <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? 'Your Account'
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ''}
                  imageUrl={user.picture ?? ''}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
