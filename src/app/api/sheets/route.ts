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

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        team_name,
        leader_name,
        leader_institute,
        leader_email,
        leader_whatsapp_number,
        member_count,
        member2_name,
        member2_institute,
        member3_name,
        member3_institute,
        competition_name,
        submission_documents!inner (
          team_folder_link,
          student_id_card_link,
          twibbon_upload_link,
          instagram_story_link,
          member2_student_id_card_link,
          member2_twibbon_upload_link,
          member2_instagram_story_link,
          member3_student_id_card_link,
          member3_twibbon_upload_link,
          member3_instagram_story_link,
          payment_proof,
          task_link
        )
      `)
      .eq('id', teamId)
      .single();

    if (error || !team) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Team not found', detail: error?.message }, { status: 404 });
    }

    const docs = (team.submission_documents as any) || {};

    const rowData = [
      team.team_name || '',
      team.competition_name || '',
      String(team.member_count || 1),

      team.leader_name || '',
      team.leader_institute || '',
      team.leader_email || '',
      team.leader_whatsapp_number || '',

      team.member2_name || '',
      team.member2_institute || '',

      team.member3_name || '',
      team.member3_institute || '',

      docs.team_folder_link || '',

      docs.student_id_card_link || '',
      docs.twibbon_upload_link || '',
      docs.instagram_story_link || '',

      docs.member2_student_id_card_link || '',
      docs.member2_twibbon_upload_link || '',
      docs.member2_instagram_story_link || '',

      docs.member3_student_id_card_link || '',
      docs.member3_twibbon_upload_link || '',
      docs.member3_instagram_story_link || '',

      docs.task_link || '',
      docs.payment_proof || '',
    ];

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
      range: 'Sheet1!A:X',
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