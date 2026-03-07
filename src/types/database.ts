export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            automations: {
                Row: {
                    action_config: Json
                    created_at: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    trigger_config: Json
                    workspace_id: string
                }
                Insert: {
                    action_config: Json
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    trigger_config: Json
                    workspace_id: string
                }
                Update: {
                    action_config?: Json
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    trigger_config?: Json
                    workspace_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "automations_workspace_id_fkey"
                        columns: ["workspace_id"]
                        isOneToOne: false
                        referencedRelation: "workspaces"
                        referencedColumns: ["id"]
                    },
                ]
            }
            cards: {
                Row: {
                    column_id: string
                    contact_name: string
                    contact_phone: string
                    created_at: string | null
                    custom_data_jsonb: Json | null
                    due_date: string | null
                    entry_date: string | null
                    id: string
                    workspace_id: string
                }
                Insert: {
                    column_id: string
                    contact_name: string
                    contact_phone: string
                    created_at?: string | null
                    custom_data_jsonb?: Json | null
                    due_date?: string | null
                    entry_date?: string | null
                    id?: string
                    workspace_id: string
                }
                Update: {
                    column_id?: string
                    contact_name?: string
                    contact_phone?: string
                    created_at?: string | null
                    custom_data_jsonb?: Json | null
                    due_date?: string | null
                    entry_date?: string | null
                    id?: string
                    workspace_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "cards_column_id_fkey"
                        columns: ["column_id"]
                        isOneToOne: false
                        referencedRelation: "columns"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "cards_workspace_id_fkey"
                        columns: ["workspace_id"]
                        isOneToOne: false
                        referencedRelation: "workspaces"
                        referencedColumns: ["id"]
                    },
                ]
            }
            columns: {
                Row: {
                    created_at: string | null
                    id: string
                    order: number
                    title: string
                    workspace_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    order: number
                    title: string
                    workspace_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    order?: number
                    title?: string
                    workspace_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "columns_workspace_id_fkey"
                        columns: ["workspace_id"]
                        isOneToOne: false
                        referencedRelation: "workspaces"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    email: string
                    full_name: string | null
                    id: string
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    email: string
                    full_name?: string | null
                    id: string
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    email?: string
                    full_name?: string | null
                    id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            workspaces: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                    owner_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    owner_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                    owner_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "workspaces_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
