// app/api/pdf/[id]/route.js
import clientPromise from '../../../../lib/db';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('pdfs');

  const pdf = await collection.findOne({ _id: new ObjectId(params.id) });

  if (!pdf) {
    return new Response('PDF not found', { status: 404 });
  }

  return new Response(JSON.stringify(pdf));
}

export async function PUT(req, { params }) {
  const { progress, completed } = await req.json();

  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('pdfs');

  const result = await collection.updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { progress, completed } }
  );

  if (!result.modifiedCount) {
    return new Response('Failed to update', { status: 500 });
  }

  return new Response('Updated successfully');
}
