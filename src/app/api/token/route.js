import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(request) {
    if (!process.env.MIDTRANS_SERVER_KEY || !process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
        console.error("Missing Midtrans environment variables!");
        return NextResponse.json(
            { error: "Server configuration error: Midtrans keys are missing." },
            { status: 500 }
        );
    }

    const snap = new Midtrans.Snap({
        isProduction: process.env.NODE_ENV !== 'development',
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    try {
        const requestBody = await request.json();
        const transaction = {
            transaction_details: {
                order_id: `order-${Date.now()}-${Math.random().toString(16)}`,
                gross_amount: requestBody.amount,
            },
            customer_details: {
                first_name: requestBody.first_name,
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/register/success`,
                error: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/register/failed`,
                pending: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/register/failed`,
                notification: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/api/midtrans-notification`, // This should point to your webhook endpoint
            },
        };
        const token = await snap.createTransaction(transaction);
        console.log(token);
        return NextResponse.json({ token });
    } catch (error) {
        console.error("Error creating Midtrans transaction:", error);
        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Failed to create transaction: ${error.message}` },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: "An unexpected error occurred while creating transaction." },
            { status: 500 }
        );
    }
}