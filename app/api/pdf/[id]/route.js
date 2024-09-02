import clientPromise from '@/lib/db';
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

export async function DELETE(request) {
  const client = await clientPromise;
  const db = client.db();
  const id = request.url.split('/').pop();

  try {
    const result = await db.collection('pdfs').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ message: 'File deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}