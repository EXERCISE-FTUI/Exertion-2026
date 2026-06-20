import { NextResponse } from 'next/server';
import { oauth2Client } from '@/utils/google/googleAuth';

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    return response;
}

export async function POST(req: Request) {
    try {
        const { fileName, mimeType, folderId } = await req.json();

        if (!fileName || !mimeType || !folderId) {
            const errorResponse = NextResponse.json(
                { error: 'Missing fileName, mimeType, or folderId in request body.' },
                { status: 400 }
            );
            return errorResponse;
        }

        const { token: access_token } = await oauth2Client.getAccessToken();

        if (!access_token) {
            throw new Error('Failed to retrieve access token from Google OAuth2 client. Ensure refresh token is valid.');
        }

        const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
        const driveMetadata = {
            name: fileName,
            mimeType: mimeType,
            parents: [folderId],
        };

        const headers = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Type': mimeType,
        };

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(driveMetadata),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            const errorResponse = NextResponse.json(
                { error: `Google API Error: ${JSON.stringify(errorData)}` },
                { status: response.status }
            );
            return errorResponse;
        }

        const resumableSessionUri = response.headers.get('Location');
        if (!resumableSessionUri) {
            const errorResponse = NextResponse.json(
                { error: 'Resumable session URI not found in response headers.' },
                { status: 500 }
            );
            return errorResponse;
        }

        const successResponse = NextResponse.json({ resumableSessionUri });
        return successResponse;

    } catch (error: any) {
        console.error('Error initiating resumable upload:', error);
        const errorResponse = NextResponse.json(
            { error: `Failed to initiate resumable upload: ${error.message}` },
            { status: 500 }
        );
        return errorResponse;
    }
}