import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
function parseDate(dateStr: string | null): string | null {
    if (!dateStr) return null
    
    // Tenta DD/MM/YYYY
    const dmyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (dmyMatch) {
        const [_, day, month, year] = dmyMatch
        return `${year}-${month}-${day}`
    }

    // Tenta YYYY-MM-DD
    const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (ymdMatch) return dateStr

    return null
}

export async function GET(request: NextRequest) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    const columnId = searchParams.get("columnId")

    let query = supabase.from("cards").select("*")

    if (columnId) {
        query = query.eq("column_id", columnId).order("order_index", { ascending: true })
    } else if (workspaceId) {
        query = query.eq("workspace_id", workspaceId).order("order_index", { ascending: true })
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data.map((card: any) => ({
        ...card,
        contact_name: card.client_name,
        contact_phone: card.phone,
        due_date: card.deadline_date
    })))
}

export async function POST(request: NextRequest) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
        .from("cards")
        .insert([{
            column_id: body.column_id,
            workspace_id: body.workspace_id,
            title: body.title || body.contact_name || "Novo Card",
            client_name: body.contact_name || body.title || "Novo Card",
            phone: body.contact_phone || body.phone || "",
            deadline_date: parseDate(body.due_date),
            order_index: 0,
            description: ""
        }])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        ...data,
        contact_name: data.client_name,
        contact_phone: data.phone,
        due_date: data.deadline_date
    })
}

export async function PUT(request: NextRequest) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    if (body.action === "move") {
        const { data: updatedCard, error } = await supabase
            .from("cards")
            .update({ column_id: body.column_id })
            .eq("id", body.cardId)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: updatedCard })
    }

    const { data: updatedCard, error } = await supabase
        .from("cards")
        .update({
            title: body.title || body.contact_name,
            client_name: body.contact_name || body.title,
            phone: body.contact_phone,
            deadline_date: parseDate(body.due_date)
        })
        .eq("id", body.cardId)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        ...updatedCard,
        contact_name: updatedCard.client_name,
        contact_phone: updatedCard.phone,
        due_date: updatedCard.deadline_date
    })
}

export async function DELETE(request: NextRequest) {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get("cardId")

    if (!cardId) {
        return NextResponse.json({ error: "cardId é obrigatório" }, { status: 400 })
    }

    const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", cardId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}