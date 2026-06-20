import { NextResponse } from 'next/server';
import { oauth2Client as auth } from '@/utils/google/googleAuth';

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    return response;
}

export async function PUT(req: Request) {
    try {
        const resumableSessionUri = req.headers.get('X-Resumable-Session-URI');
        const contentRange = req.headers.get('Content-Range');
        const contentType = req.headers.get('Content-Type');
        const contentLength = req.headers.get('Content-Length');

        if (!resumableSessionUri || !contentRange || !contentType || !contentLength) {
            const errorResponse = NextResponse.json(
                { error: 'Missing required headers: X-Resumable-Session-URI, Content-Range, Content-Type, Content-Length.' },
                { status: 400 }
            );
            return errorResponse;
        }

        const { token: access_token } = await auth.getAccessToken();

        if (!access_token) {
            throw new Error('Failed to retrieve access token from Google OAuth2 client. Ensure refresh token is valid.');
        }

        const chunkBuffer = await req.arrayBuffer();

        const driveHeaders = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': contentType,
            'Content-Range': contentRange,
            'Content-Length': contentLength,
        };

        const driveResponse = await fetch(resumableSessionUri, {
            method: 'PUT',
            headers: driveHeaders,
            body: chunkBuffer,
        });

        if (!driveResponse.ok && driveResponse.status !== 308) {
            const errorData = await driveResponse.json().catch(() => ({ message: driveResponse.statusText }));
            const errorResponse = NextResponse.json(
                { error: `Google Drive upload chunk failed with status ${driveResponse.status}: ${JSON.stringify(errorData)}` },
                { status: driveResponse.status }
            );
            return errorResponse;
        }

        const successResponse = new NextResponse(null, { status: driveResponse.status });

        const rangeHeader = driveResponse.headers.get('Range');
        if (rangeHeader) {
            successResponse.headers.set('Range', rangeHeader);
        }

        const locationHeader = driveResponse.headers.get('Location');
        if (locationHeader) {
            successResponse.headers.set('Location', locationHeader);
        }

        return successResponse;

    } catch (error: any) {
        console.error('Error uploading chunk via backend proxy:', error);
        const errorResponse = NextResponse.json(
            { error: `Failed to upload chunk via backend proxy: ${error.message}` },
            { status: 500 }
        );
        return errorResponse;
    }
}