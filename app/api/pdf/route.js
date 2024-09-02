import clientPromise from '@/lib/db';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('pdfs');
  try {
    const files = await collection.find({}).toArray();
    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch files' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
