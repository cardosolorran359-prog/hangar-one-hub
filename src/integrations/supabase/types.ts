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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json
          organization_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          organization_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_member_profiles: {
        Row: {
          display_name: string | null
          email: string
          updated_at: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          email: string
          updated_at?: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          email?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          active: boolean
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_modules: {
        Row: {
          created_at: string
          enabled: boolean
          module_key: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          module_key: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          module_key?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_modules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_plugins: {
        Row: {
          category: string
          created_at: string
          description: string | null
          enabled: boolean
          name: string
          organization_id: string
          plugin_key: string
          updated_at: string
          version: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          name: string
          organization_id: string
          plugin_key: string
          updated_at?: string
          version?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          name?: string
          organization_id?: string
          plugin_key?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_plugins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_state: {
        Row: {
          organization_id: string
          state: Json
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          organization_id: string
          state?: Json
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          organization_id?: string
          state?: Json
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_state_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          plan: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          plan?: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tech_bookmarks: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tech_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      tech_document_terms: {
        Row: {
          document_id: string
          term_id: string
          weight: number
        }
        Insert: {
          document_id: string
          term_id: string
          weight?: number
        }
        Update: {
          document_id?: string
          term_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "tech_document_terms_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "tech_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_document_terms_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "tech_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_documents: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          manufacturer: string | null
          model: string | null
          owner_id: string | null
          page_count: number | null
          search_text: string
          source_kind: string
          source_name: string
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          model?: string | null
          owner_id?: string | null
          page_count?: number | null
          search_text?: string
          source_kind?: string
          source_name: string
          storage_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          model?: string | null
          owner_id?: string | null
          page_count?: number | null
          search_text?: string
          source_kind?: string
          source_name?: string
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tech_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tech_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_procedure_documents: {
        Row: {
          document_id: string
          page_end: number | null
          page_start: number | null
          procedure_id: string
        }
        Insert: {
          document_id: string
          page_end?: number | null
          page_start?: number | null
          procedure_id: string
        }
        Update: {
          document_id?: string
          page_end?: number | null
          page_start?: number | null
          procedure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tech_procedure_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "tech_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_procedure_documents_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "tech_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_procedure_steps: {
        Row: {
          body: string
          created_at: string
          id: string
          procedure_id: string
          risk_note: string | null
          step_number: number
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          procedure_id: string
          risk_note?: string | null
          step_number: number
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          procedure_id?: string
          risk_note?: string | null
          step_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tech_procedure_steps_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "tech_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_procedures: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          difficulty: string
          id: string
          model_family: string | null
          owner_id: string | null
          platform: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          model_family?: string | null
          owner_id?: string | null
          platform?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          model_family?: string | null
          owner_id?: string | null
          platform?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tech_procedures_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tech_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_search_events: {
        Row: {
          created_at: string
          id: string
          query: string
          selected_document_id: string | null
          selected_procedure_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          selected_document_id?: string | null
          selected_procedure_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          selected_document_id?: string | null
          selected_procedure_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tech_search_events_selected_document_id_fkey"
            columns: ["selected_document_id"]
            isOneToOne: false
            referencedRelation: "tech_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_search_events_selected_procedure_id_fkey"
            columns: ["selected_procedure_id"]
            isOneToOne: false
            referencedRelation: "tech_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_search_history: {
        Row: {
          created_at: string
          filters: Json
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      tech_synonyms: {
        Row: {
          created_at: string
          id: string
          normalized: string
          synonym: string
          term_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          normalized: string
          synonym: string
          term_id: string
        }
        Update: {
          created_at?: string
          id?: string
          normalized?: string
          synonym?: string
          term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tech_synonyms_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "tech_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_terms: {
        Row: {
          created_at: string
          id: string
          normalized: string
          term: string
          term_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          normalized: string
          term: string
          term_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          normalized?: string
          term?: string
          term_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_org_invite: {
        Args: never
        Returns: {
          organization_id: string
          role: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
