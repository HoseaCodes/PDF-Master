import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getSession } from 'next-auth/react';

export async function POST(req, { params }) {
  const session = await getSession({ req });
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { progress, completed, progressIndex } = await req.json();

  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('pdfs');

  const result = await collection.updateOne(
    { _id: new ObjectId(params.id), userId: session.user.id },
    {
      $set: {
        progress,
        completed,
        progressIndex,
      },
    }
  );

  if (result.modifiedCount === 0) {
    return new Response('PDF not found or not modified', { status: 404 });
  }

  return new Response('Progress updated', { status: 200 });
}
