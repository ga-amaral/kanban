import { NextRequest, NextResponse } from "next/server"
import { getSupabaseWithUser } from "@/lib/supabase/api-auth"

export async function GET(request: NextRequest) {
    const { supabase, user } = await getSupabaseWithUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
    const { supabase, user } = await getSupabaseWithUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
        .from("workspaces")
        .insert([{
            owner_id: user.id,
            name: body.name || "Novo Workspace"
        }])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
    const { supabase, user } = await getSupabaseWithUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.workspaceId) {
        return NextResponse.json({ error: "workspaceId é obrigatório" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("workspaces")
        .update({ name: body.name })
        .eq("id", body.workspaceId)
        .eq("owner_id", user.id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
    const { supabase, user } = await getSupabaseWithUser(request)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
        return NextResponse.json({ error: "workspaceId é obrigatório" }, { status: 400 })
    }

    const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", workspaceId)
        .eq("owner_id", user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
