import Dashboard from '@/components/dashboard';
// import { db } from '@/db';
// import { getUserSubscriptionPlan } from '@/lib/stripe';
// import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

const Page = async () => {
//   const { getUser } = getKindeServerSession();
  const getUser = () => { }
  const user = getUser();

//   if (!user || !user.id) redirect('/auth-callback?origin=dashboard');

//   const dbUser = await db.user.findFirst({
//     where: {
//       id: user.id
//     }
//   });

//   if (!dbUser) redirect('/auth-callback?origin=dashboard');

//   const subscriptionPlan = await getUserSubscriptionPlan();
  const subscriptionPlan = { isSubscribed: false };

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default Page;
