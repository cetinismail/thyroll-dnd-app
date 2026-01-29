"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function generateJoinCode() {
    // Generate a random 6-character code (A-Z, 0-9)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as 3-3 (e.g. ABC-123)
    return `${code.substring(0, 3)}-${code.substring(3, 6)}`;
}

export async function createCampaign(formData: FormData) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const joinCode = generateJoinCode();

    const { data, error } = await supabase.from("campaigns").insert({
        dm_id: user.id,
        title,
        description,
        join_code: joinCode
    }).select().single();

    if (error) {
        console.error("Campaign Creation Error:", error);
        throw new Error("Failed to create campaign");
    }

    revalidatePath("/dashboard/campaigns");
    redirect(`/dashboard/campaigns/${data.id}`);
}

export async function joinCampaign(formData: FormData) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const code = formData.get("code") as string;
    const characterId = formData.get("character_id") as string;

    // 1. Find Campaign by Code
    const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select("id")
        .eq("join_code", code)
        .single();

    if (campaignError || !campaign) {
        throw new Error("Invalid join code");
    }

    // 2. Check if already member
    const { data: existing } = await supabase
        .from("campaign_members")
        .select("id")
        .eq("campaign_id", campaign.id)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        // Already joined, just redirect
        redirect(`/dashboard/campaigns/${campaign.id}`);
    }

    // 3. Insert Member
    const { error: joinError } = await supabase.from("campaign_members").insert({
        campaign_id: campaign.id,
        user_id: user.id,
        character_id: characterId,
        role: "player"
    });

    if (joinError) {
        console.error("Join Error:", joinError);
        throw new Error("Failed to join campaign");
    }

    revalidatePath("/dashboard/campaigns");
    redirect(`/dashboard/campaigns/${campaign.id}`);
}

export async function getUserCampaigns() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { dmCampaigns: [], playerCampaigns: [] };

    // 1. Fetch Campaigns where I am DM
    const { data: dmCampaigns } = await supabase
        .from("campaigns")
        .select("*")
        .eq("dm_id", user.id)
        .order("created_at", { ascending: false });

    // 2. Fetch Campaigns where I am Player
    // Ensure we fetch the campaign details along with member info
    const { data: memberships } = await supabase
        .from("campaign_members")
        .select(`
            campaign_id,
            joined_at,
            campaigns (
                id,
                title,
                description,
                dm_id
            )
        `)
        .eq("user_id", user.id);

    // Extract the inner campaign object from memberships
    // Note: Supabase types might require casting or careful handling here
    const playerCampaigns = memberships?.map((m: any) => m.campaigns).filter(Boolean) || [];

    return {
        dmCampaigns: dmCampaigns || [],
        playerCampaigns: playerCampaigns
    };
}

export async function getCampaignDetails(campaignId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Fetch Campaign Info
    const { data: campaign, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

    if (error || !campaign) throw new Error("Campaign not found");

    // 2. Fetch Members & Characters
    // Join with Auth Users (for email/avatar) and Characters (for stats)
    // Note: Supabase join syntax depends on FK names.
    // 'user_id' -> auth.users? (Usually not directly accessible strictly via join unless public profile view)
    // For now, let's fetch 'campaign_members' and 'characters'.

    // We need to verify if Current User is allowed to see this
    // The RLS policy "Members or DM can see" handles security, so a simple fetch is safe.
    // If it returns empty/error, RLS blocked it.

    const { data: members, error: memError } = await supabase
        .from("campaign_members")
        .select(`
            id,
            role,
            joined_at,
            user_id,
            character_id,
            characters (
                id,
                name,
                class,
                level,
                race,
                hp_current,
                hp_max,
                stats
            )
        `)
        .eq("campaign_id", campaignId);

    if (memError) throw new Error("Access Denied");

    return {
        campaign,
        members: members || [],
        isDM: campaign.dm_id === user.id,
        currentUserId: user.id
    };
}
