// app/api/drive/finalize-upload/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { oauth2Client as auth } from '@/utils/google/googleAuth';

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    return response;
}

export async function POST(req: Request) {
    try {
        const { resumableSessionUri, fileId } = await req.json();

        if (!resumableSessionUri && !fileId) {
            const errorResponse = NextResponse.json({ error: 'Missing resumableSessionUri or fileId.' }, { status: 400 });
            return errorResponse;
        }

        const { token: access_token } = await auth.getAccessToken();
        if (!access_token) {
            throw new Error('Failed to retrieve access token from Google OAuth2 client. Ensure refresh token is valid.');
        }

        let fileMetadata: any;

        if (fileId) {
            const drive = google.drive({ version: 'v3', auth: auth });
            const res = await drive.files.get({
                fileId: fileId,
                fields: 'id, name, webContentLink, webViewLink, mimeType, size',
            });
            fileMetadata = res.data;
        } else if (resumableSessionUri) {
            const response = await fetch(resumableSessionUri, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Length': '0',
                    'Content-Range': `bytes */*`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Failed to finalize upload via URI: ${JSON.stringify(errorData)}`);
            }
            fileMetadata = await response.json();
        } else {
            const errorResponse = NextResponse.json({ error: 'Invalid request: No URI or File ID provided.' }, { status: 400 });
            return errorResponse;
        }

        const successResponse = NextResponse.json({ fileMetadata });
        return successResponse;

    } catch (error: any) {
        console.error('Error finalizing upload:', error);
        const errorResponse = NextResponse.json(
            { error: `Failed to finalize upload: ${error.message}` },
            { status: 500 }
        );
        return errorResponse;
    }
}