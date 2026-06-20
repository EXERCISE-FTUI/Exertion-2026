"use server"

import { createClient } from "@/utils/supabase/server";

export const getTeamDriveFolderId = async (): Promise<string | null> => {
  const supabase = await createClient();

  //  get user id supabase
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("Error fetching user:", userError);
    return null;
  }

  // Fetch the team folder ID from the database
  const { data: teamsData, error: teamError } = await supabase
    .from('teams')
    .select('id')
    .eq('leader_user_id', userData.user.id)
    .single();

  if (teamError || !teamsData) {
    console.error("Error fetching team folder ID:", teamError);
    return null;
  }

  const { data: submissionData, error: submissionError } = await supabase
    .from('submission_documents')
    .select('team_folder_link')
    .eq('team_id', teamsData.id)
    .single();

  if (submissionError || !submissionData) {
    console.error("Error fetching submission data:", submissionError);
    return null;
  }

  let resTeamFolderId: string | null = null

  if (submissionData.team_folder_link !== null) {
    const match = submissionData.team_folder_link.match(/(?:\/folders\/|\/d\/)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      resTeamFolderId = match[1];
    } else {
      console.error("Folder ID tidak ditemukan di link:", submissionData.team_folder_link);
      resTeamFolderId = null;
    }
  }

  return resTeamFolderId;
};