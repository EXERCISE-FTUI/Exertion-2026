"use server"

import { oauth2Client as auth } from "./googleAuth"; // Import oauth2Client Anda
import { createClient } from "../supabase/server";
import { google } from 'googleapis';

const competitions = [
    {
        id: 'ui/ux',
        name: "UI/UX Design",
        icon: "/icons/uixdesign.sv",
        uuid: "ae179e48-61c7-4d24-a19f-5c29b833ef18",
        documentDriveId: "134x09gvtgwisQ2WLWfDFGLnCqT5iyVRN"
    },

    {
        id: "exermind",
        name: "ExerMind",
        icon: "/icons/exermind.png",
        uuid: "50fd83d0-b25f-4d55-ab94-59c8d0cddaf0",
        documentDriveId: "1MGp0KxfyEYYM4JM9xIfSNwsQeoH8m0G6"
    },

    {
        id: "business",
        name: "Business Case Competition",
        icon: "/icons/business.png",
        uuid: "9c200794-6ade-4817-b7ec-f039242705ef",
        documentDriveId: "1w9bwTTpJXmL-UdK2WFFFRVOrRzH4D7mk"
    },

    {
        id: "infografis",
        name: "Infografis",
        // TUGAS FRONTEND: Ganti ke yang baru
        icon: "/icons/business.png",
        uuid: "087f3607-8cc5-478c-973e-3c638fbca82e",
        documentDriveId: "1PeyZgiZoaPbc33IlDkqwBEv2opPSO5C6"
    }
]

// kompetisi lama
// const competitions = [
//     {
//         id: "uiux",
//         name: "UI/UX Design",
//         icon: "/icons/uixdesign.svg",
//         uuid: "6e9e2834-e448-406a-808c-54462ba196d1",
//         documentDriveId: "1P1eqzK-EQa2aUnqEx6V0IrHcosD9fBU6",
//     },
//     {
//         id: "exermind",
//         name: "ExerMind",
//         icon: "/icons/exermind.png",
//         uuid: "267797ae-a1f6-47ca-b3b2-899538f6706a",
//         documentDriveId: "1rtbpboNLCHhGD1tmJzKMYyfIt66brkxe",
//     },
//     {
//         id: "business",
//         name: "Business Innovation",
//         icon: "/icons/business.png",
//         uuid: "ba18d40b-fb13-4fd9-a5bb-af9f78aca8c4",
//         documentDriveId: "1ibOO6PjZjhBZJVNXg7kAPPBV3q7rdghC",
//     },
// ];

function getDocumentDriveIdByCompetitionUuid(competitionUuid: string): string | undefined {
    return competitions.find((competition) => competition.uuid === competitionUuid)?.documentDriveId;
}

export async function getOrCreateTeamFolder(competitionUuid: string) {
    console.log("masuk getorcreate")
    const parentTeamFolderId = getDocumentDriveIdByCompetitionUuid(competitionUuid);

    if (!parentTeamFolderId) {
        console.log('parent team folder id not found');
        throw new Error("Competition folder ID not found. Please check 'competitions' configuration.");
    }

    const drive = google.drive({ version: 'v3', auth: auth });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User is not authenticated");
    }

    const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("id, team_name, competition_id")
        .eq("leader_user_id", user.id)
        .single();

    if (teamError) {
        if (teamError.code === 'PGRST116') {
            console.log("Tidak ditemukan tim dengan leader_user_id tersebut.");
            return null;
        } else {
            console.error("Error lainnya saat mencari tim:", teamError.message);
            throw new Error(`Failed to fetch team data: ${teamError.message}`);
        }
    }

    if (!teamData) {
        console.log("Team data is null after query.");
        return null;
    }

    const { data: submissionData, error: folderError } = await supabase
        .from("submission_documents")
        .select("team_folder_link")
        .eq("team_id", teamData.id)
        .single();

    if (folderError && folderError.code !== 'PGRST116') {
        console.error("Error fetching existing team folder link:", folderError);
        throw new Error(`Failed to fetch existing team folder link: ${folderError.message}`);
    }

    if (submissionData?.team_folder_link) {
        const tempFolderId = submissionData.team_folder_link.split('/').pop();
        if (tempFolderId) {
            try {
                await drive.files.delete({
                    fileId: tempFolderId,
                });
                console.log(`Successfully deleted old Drive folder: ${tempFolderId}`);
            } catch (error: any) {
                console.warn(`Could not delete old team folder (${tempFolderId}) from Drive: ${error.message}`);
            }
        }

        const { error: deleteSupabaseError } = await supabase
            .from("submission_documents")
            .delete()
            .eq("team_id", teamData.id);

        if (deleteSupabaseError) {
            console.error("Error deleting old team folder link from Supabase:", deleteSupabaseError);
            throw new Error(`Failed to clear old team folder data from database: ${deleteSupabaseError.message}`);
        }
        console.log(`Successfully cleared old folder link for team ${teamData.id} from Supabase.`);
    }

    const folderMetadata = {
        name: teamData.team_name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentTeamFolderId],
    };

    const folderResponse = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, webViewLink',
    });

    if (!folderResponse || !folderResponse.data || !folderResponse.data.id) {
        throw new Error("Google Drive folder creation failed. Check API permissions or folder existence.");
    }

    const teamFolderId = folderResponse.data.id;
    const teamFolderLink = folderResponse.data.webViewLink;
    console.log(teamFolderLink)

    const { error: upsertError } = await supabase
        .from("submission_documents")
        .upsert({
            team_id: teamData.id,
            team_folder_link: teamFolderLink,
        }, { onConflict: 'team_id' });

    if (upsertError) {
        console.error("Error upserting new team folder link:", upsertError);
        throw new Error(`Failed to save new team folder link to database: ${upsertError.message}`);
    }

    return {
        folderLink: teamFolderLink,
        folderId: teamFolderId
    };
}