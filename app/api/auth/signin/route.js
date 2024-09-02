import clientPromise from '@/lib/db';


export async function GET(request) {
    
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('users');
    const { email } = await request.json();
    const user = await collection.findOne({ email });
    if (!user) {
        return new Response('User not found', { status: 404 });
    }
    return new Response(JSON.stringify(user));
}

export async function POST(request) {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('users');
    const { email, password } = await request.json();

    // Check if email and password are provided
    if (!email || !password) {
        return new Response(JSON.stringify({
            success: false,
            status: 400,
            message: 'email and password are required',
            data: email,
        }));
    }

    // Find the user in the database
    const user = await collection.findOne({ email });

    // If user is not found, return an error
    if (!user) {
        return new Response(JSON.stringify({
            success: false,
            status: 400,
            message: 'Invalid credentials'
        }));
    }

    if (password !== user.password) {
        return new Response(JSON.stringify({
            success: false,
            status: 400,
            message: 'Wrong Password'
        }));
    }

    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (isPasswordValid) {
    //     return new Response(JSON.stringify({
    //         success: true,
    //         status: 200,
    //         data: user
    //     }));
    // } else {
    //     return new Response(JSON.stringify({
    //         success: false,
    //         status: 400,
    //         message: 'Wrong Password'
    //     }));
    // }

    return new Response(JSON.stringify({
        success: true,
        status: 200,
        data: user
    }));
}