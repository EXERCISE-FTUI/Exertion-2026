import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { teamId } = await request.json();
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Query JOIN
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        team_name,
        institute,
        leader_name,
        leader_whatsapp_number,
        member1_name,
        member2_name,
        member2_whatsapp_number,
        competition_name,
        team_folder_link,
        submission_documents (
          student_id_card_link,
          twibbon_upload_link,
          exertion_follow_proof_link,
          exercise_ftui_follow_proof_link,
          payment_proof,
          task_link
        )
      `)
      .eq('id', teamId)
      .single();

    if (error || !team) {
      return NextResponse.json({ error: 'Team not found or error fetching data' }, { status: 404 });
    }

    const docs = team.submission_documents?.[0] || {};

    const rowData = [
      team.team_name || '',
      team.institute || '',
      team.leader_name || '',
      team.leader_whatsapp_number || '',
      team.member1_name || '',
      team.member2_name || '',
      team.member2_whatsapp_number || '',
      team.competition_name || '',
      team.team_folder_link || '',
      docs.student_id_card_link || '',
      docs.twibbon_upload_link || '',
      docs.exertion_follow_proof_link || '',
      docs.exercise_ftui_follow_proof_link || '',
      docs.payment_proof || '',
      docs.task_link || ''
    ];

    // // TODO: [USER] Masukkan Base64 dari JSON credentials service account Google Anda ke environment variable GOOGLE_SERVICE_ACCOUNT_BASE64
    // // TODO: [USER] Masukkan Spreadsheet ID dari Google Sheets Anda ke environment variable GOOGLE_SPREADSHEET_ID
    // // TODO: [USER] Sesuaikan nama sheet (contoh: 'Sheet1')
    
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 || !process.env.GOOGLE_SPREADSHEET_ID) {
        console.warn("Google Sheets credentials not set. Skipping sheets integration.");
        return NextResponse.json({ success: true, message: 'Saved to DB, skipped sheets (no credentials)' });
    }

    const credentialsDecoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    const credentials = JSON.parse(credentialsDecoded);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Sheet1!A:O', // // TODO: [USER] Sesuaikan dengan nama sheet target Anda
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error in sheets integration:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
