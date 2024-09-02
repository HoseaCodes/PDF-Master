'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { signIn } from "next-auth/react";

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log(email, password);
            const resdata = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            console.log("resdata", resdata);
            if (
                resdata.status === 400 ||
                resdata.status === 401 ||
                resdata.status === 403
            ) {
                console.log("Invalid Credentials!");
                alert('Invalid Credentials!');
            } else if (resdata.status === 500) {
                console.log(
                    "Server error!"
                );
                alert('Server error!');
            } else {
                alert('Login successfull!');
                router.push('/dashboard');
                console.log(resdata);
            }
        } catch (err) {
            console.error('Sign-in error:', err);
            setError('An unexpected error occurred');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md p-6 shadow-lg bg-white rounded-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full"
                    />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full"
                    />
                    <Button type="submit" className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                        Sign In
                    </Button>
                    {error && <Alert variant="error" className="mt-4">{error}</Alert>}
                </form>
            </Card>
        </div>
    );
}
