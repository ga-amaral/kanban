import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
        return NextResponse.json({ error: "workspaceId é obrigatório" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
        .from("columns")
        .insert([{
            workspace_id: body.workspaceId,
            board_id: body.boardId,
            title: body.title || "Nova Coluna",
            "order": body.order || 0
        }])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const columnId = searchParams.get("columnId")

    if (!columnId) {
        return NextResponse.json({ error: "columnId é obrigatório" }, { status: 400 })
    }

    const { error } = await supabase
        .from("columns")
        .delete()
        .eq("id", columnId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}