export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_agents: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          model_name: string | null
          name: string
          owner_id: string
          provider: string | null
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          model_name?: string | null
          name: string
          owner_id: string
          provider?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          model_name?: string | null
          name?: string
          owner_id?: string
          provider?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      board_members: {
        Row: {
          access_level: string
          board_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          board_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          access_level?: string
          board_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_members_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      board_options: {
        Row: {
          board_id: string
          color: string
          created_at: string
          id: string
          label: string
          order_index: number | null
          type: string
        }
        Insert: {
          board_id: string
          color?: string
          created_at?: string
          id?: string
          label: string
          order_index?: number | null
          type: string
        }
        Update: {
          board_id?: string
          color?: string
          created_at?: string
          id?: string
          label?: string
          order_index?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_options_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          assigned_to: string | null
          client_name: string | null
          column_id: string
          workspace_id: string | null
          created_at: string
          created_by: string | null
          deadline_date: string | null
          debts: string | null
          description: string | null
          entry_date: string | null
          id: string
          lawsuit_number: string | null
          legal_product: string | null
          order_index: number
          phone: string | null
          practice_area: string | null
          title: string
          updated_at: string
          urgency_level: Database["public"]["Enums"]["urgency_level"] | null
          value_range: string | null
          custom_data_jsonb: Json | null
        }
        Insert: {
          assigned_to?: string | null
          client_name?: string | null
          column_id: string
          workspace_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline_date?: string | null
          debts?: string | null
          description?: string | null
          entry_date?: string | null
          id?: string
          lawsuit_number?: string | null
          legal_product?: string | null
          order_index: number
          phone?: string | null
          practice_area?: string | null
          title: string
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
          value_range?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_name?: string | null
          column_id?: string
          workspace_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline_date?: string | null
          debts?: string | null
          description?: string | null
          entry_date?: string | null
          id?: string
          lawsuit_number?: string | null
          legal_product?: string | null
          order_index?: number
          phone?: string | null
          practice_area?: string | null
          title?: string
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
          value_range?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      columns: {
        Row: {
          board_id: string
          workspace_id: string | null
          created_at: string
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          board_id: string
          workspace_id?: string | null
          created_at?: string
          id?: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          board_id?: string
          workspace_id?: string | null
          created_at?: string
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users_profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
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
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      urgency_level: "LOW" | "MED" | "HIGH"
      user_role: "MASTER" | "ADMIN" | "ADV" | "ASSISTANT" | "ESTAGIARIO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      urgency_level: ["LOW", "MED", "HIGH"],
      user_role: ["MASTER", "ADMIN", "ADV", "ASSISTANT", "ESTAGIARIO"],
    },
  },
} as const
