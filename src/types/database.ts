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
      ai_agents: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
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
          is_active?: boolean | null
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
          is_active?: boolean | null
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
      api_keys: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          key_hash: string
          last_used_at: string | null
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          last_used_at?: string | null
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          last_used_at?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
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
          action_config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config?: Json
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
          client_name: string
          column_id: string
          created_at: string | null
          custom_data_jsonb: Json | null
          deadline_date: string | null
          description: string | null
          id: string
          order_index: number
          phone: string
          title: string | null
          urgency_level: string | null
          workspace_id: string
        }
        Insert: {
          client_name?: string
          column_id: string
          created_at?: string | null
          custom_data_jsonb?: Json | null
          deadline_date?: string | null
          description?: string | null
          id?: string
          order_index?: number
          phone?: string
          title?: string | null
          urgency_level?: string | null
          workspace_id: string
        }
        Update: {
          client_name?: string
          column_id?: string
          created_at?: string | null
          custom_data_jsonb?: Json | null
          deadline_date?: string | null
          description?: string | null
          id?: string
          order_index?: number
          phone?: string
          title?: string | null
          urgency_level?: string | null
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
      cases: {
        Row: {
          action_type: string
          bank: string
          cause_value: number | null
          client_id: string
          contract_value: number | null
          court: string
          created_at: string
          id: string
          notes: string | null
          number: string
          phase: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type?: string
          bank?: string
          cause_value?: number | null
          client_id: string
          contract_value?: number | null
          court?: string
          created_at?: string
          id?: string
          notes?: string | null
          number?: string
          phase?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          bank?: string
          cause_value?: number | null
          client_id?: string
          contract_value?: number | null
          court?: string
          created_at?: string
          id?: string
          notes?: string | null
          number?: string
          phase?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      columns: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          order_index: number
          title: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
          title: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
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
      deadlines: {
        Row: {
          alert_days_before: number
          case_id: string
          created_at: string
          due_date: string
          id: string
          is_done: boolean
          notes: string | null
          title: string
          user_id: string
        }
        Insert: {
          alert_days_before?: number
          case_id: string
          created_at?: string
          due_date: string
          id?: string
          is_done?: boolean
          notes?: string | null
          title: string
          user_id: string
        }
        Update: {
          alert_days_before?: number
          case_id?: string
          created_at?: string
          due_date?: string
          id?: string
          is_done?: boolean
          notes?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount: number
          created_at: string
          fee_id: string
          id: string
          method: string
          notes: string | null
          paid_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          fee_id: string
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          fee_id?: string
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "fees"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          case_id: string
          client_id: string
          created_at: string
          entry_value: number | null
          id: string
          notes: string | null
          paid_value: number | null
          status: string
          success_percent: number | null
          total_value: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          client_id: string
          created_at?: string
          entry_value?: number | null
          id?: string
          notes?: string | null
          paid_value?: number | null
          status?: string
          success_percent?: number | null
          total_value?: number
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string
          client_id?: string
          created_at?: string
          entry_value?: number | null
          id?: string
          notes?: string | null
          paid_value?: number | null
          status?: string
          success_percent?: number | null
          total_value?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fees_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fees_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_cadencias: {
        Row: {
          column_id: string
          id: string
          include_fields: Json
          steps: Json
          updated_at: string
          webhook_id: string | null
        }
        Insert: {
          column_id: string
          id?: string
          include_fields?: Json
          steps?: Json
          updated_at?: string
          webhook_id?: string | null
        }
        Update: {
          column_id?: string
          id?: string
          include_fields?: Json
          steps?: Json
          updated_at?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followup_cadencias_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: true
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_cadencias_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_disparos: {
        Row: {
          column_id: string
          created_at: string
          dispatched_at: string | null
          error_message: string | null
          id: string
          lead_id: string
          response_code: number | null
          scheduled_at: string
          status: string
          step: number
          webhook_id: string | null
        }
        Insert: {
          column_id: string
          created_at?: string
          dispatched_at?: string | null
          error_message?: string | null
          id?: string
          lead_id: string
          response_code?: number | null
          scheduled_at: string
          status?: string
          step: number
          webhook_id?: string | null
        }
        Update: {
          column_id?: string
          created_at?: string
          dispatched_at?: string | null
          error_message?: string | null
          id?: string
          lead_id?: string
          response_code?: number | null
          scheduled_at?: string
          status?: string
          step?: number
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followup_disparos_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_disparos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_disparos_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_automations: {
        Row: {
          action_config: Json
          action_type: string
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
          webhook_id: string | null
        }
        Insert: {
          action_config?: Json
          action_type: string
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          webhook_id?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_automations_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          position: number
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          position: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      lead_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          lead_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          lead_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_comments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_history: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          lead_id: string
          payload: Json
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          lead_id: string
          payload?: Json
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          lead_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lead_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          anotacoes: string | null
          archived: boolean
          assigned_to: string | null
          column_id: string
          como_chegou: string | null
          created_at: string
          created_by: string | null
          descricao_caso: string | null
          email: string | null
          fup_next_at: string | null
          fup_status: string
          fup_step: number | null
          id: string
          name: string
          phone: string
          product_id: string | null
          updated_at: string
          urgency: string
          valor_estimado: number | null
        }
        Insert: {
          anotacoes?: string | null
          archived?: boolean
          assigned_to?: string | null
          column_id: string
          como_chegou?: string | null
          created_at?: string
          created_by?: string | null
          descricao_caso?: string | null
          email?: string | null
          fup_next_at?: string | null
          fup_status?: string
          fup_step?: number | null
          id?: string
          name: string
          phone: string
          product_id?: string | null
          updated_at?: string
          urgency?: string
          valor_estimado?: number | null
        }
        Update: {
          anotacoes?: string | null
          archived?: boolean
          assigned_to?: string | null
          column_id?: string
          como_chegou?: string | null
          created_at?: string
          created_by?: string | null
          descricao_caso?: string | null
          email?: string | null
          fup_next_at?: string | null
          fup_status?: string
          fup_step?: number | null
          id?: string
          name?: string
          phone?: string
          product_id?: string | null
          updated_at?: string
          urgency?: string
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "legal_products"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_products: {
        Row: {
          active: boolean
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
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
          content?: string
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
      movements: {
        Row: {
          case_id: string
          created_at: string
          description: string
          event_date: string
          id: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          description: string
          event_date?: string
          id?: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movements_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          oab_number: string | null
          phone: string | null
          plan: string | null
          role: string
          status: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          oab_number?: string | null
          phone?: string | null
          plan?: string | null
          role?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          oab_number?: string | null
          phone?: string | null
          plan?: string | null
          role?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          secret: string | null
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          secret?: string | null
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          secret?: string | null
          url?: string
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
    Views: Record<string, any>
    Functions: Record<string, any>
    Enums: Record<string, any>
    CompositeTypes: Record<string, any>
  }
}

type DatabaseWithoutInternals = Database

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
    Enums: {},
  },
} as const
