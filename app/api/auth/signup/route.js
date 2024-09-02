import clientPromise from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { email, password } = await req.json();

  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('users');

  const existingUser = await collection.findOne({ email });

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  await collection.insertOne({ email, password });

  return NextResponse.json({ message: 'User created successfully' });
}
