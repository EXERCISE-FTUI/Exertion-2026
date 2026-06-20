"use server"

import { createClient } from '@/utils/supabase/server'

interface UpdateNameParams {
    full_name?: string;
    display_name?: string;
}

export async function updateNameUsername({ full_name, display_name }: UpdateNameParams) {
    // Initial validation for empty or undefined inputs
    if ((full_name === undefined || display_name === undefined) || (full_name === null || display_name === null) || (full_name === '' && display_name === '')) {
        throw new Error("Full name and display name cannot be empty or undefined.");
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Error fetching user:", userError?.message);
        throw new Error("You must be logged in to update your profile.");
    }

    const updateProfileData: { full_name?: string; display_name?: string } = {};
    const updateAuthMetaData: { full_name?: string; display_name?: string } = {};

    if (full_name !== undefined) {
        updateProfileData.full_name = full_name;
        updateAuthMetaData.full_name = full_name; // Add to metadata update
    }
    if (display_name !== undefined) {
        updateProfileData.display_name = display_name;
        updateAuthMetaData.display_name = display_name; // Add to metadata update
    }

    let hasProfileChanges = Object.keys(updateProfileData).length > 0;
    let hasAuthMetaDataChanges = Object.keys(updateAuthMetaData).length > 0;

    if (!hasProfileChanges && !hasAuthMetaDataChanges) {
        return { error: true, message: "No changes requested." };
    }

    // Update 'profiles' table
    if (hasProfileChanges) {
        const { error: updateProfileError } = await supabase
            .from('profiles')
            .update(updateProfileData)
            .eq('id', user.id);

        if (updateProfileError) {
            console.error("Error updating profile table:", updateProfileError.message);
            return { error: true, message: `Error updating profile: ${updateProfileError.message}` };
        }
    }

    // Update user metadata
    if (hasAuthMetaDataChanges) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
            data: updateAuthMetaData,
        });

        if (updateAuthError) {
            console.error("Error updating user metadata:", updateAuthError.message);
            return { error: true, message: `Error updating user metadata: ${updateAuthError.message}` };
        }
    }

    return { success: true, message: "Profile and user metadata updated successfully!" };
}