/**
 * FlashMingo — Supabase database type definitions.
 *
 * This file mirrors the schema defined in supabase/migrations/001_init_schema.sql.
 * Regenerate with: npx supabase gen types typescript --local > src/lib/types/database.ts
 */

export type Database = {
  public: {
    Tables: {
      districts: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          domain?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          updated_at?: string;
        };
        Relationships: [];
      };

      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'student' | 'teacher' | 'administrator';
          district_id: string | null;
          account_status: 'pending' | 'approved' | 'suspended';
          leaderboard_opt_in: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'student' | 'teacher' | 'administrator';
          district_id?: string | null;
          account_status?: 'pending' | 'approved' | 'suspended';
          leaderboard_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'student' | 'teacher' | 'administrator';
          district_id?: string | null;
          account_status?: 'pending' | 'approved' | 'suspended';
          leaderboard_opt_in?: boolean;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_district_id_fkey';
            columns: ['district_id'];
            referencedRelation: 'districts';
            referencedColumns: ['id'];
          },
        ];
      };

      folders: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          color?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'folders_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      tags: {
        Row: {
          id: string;
          owner_id: string;
          district_id: string | null;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          district_id?: string | null;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          color?: string | null;
        };
        Relationships: [];
      };

      demo_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          school: string;
          use_case: string | null;
          status: 'new' | 'contacted' | 'closed';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          school: string;
          use_case?: string | null;
          status?: 'new' | 'contacted' | 'closed';
          created_at?: string;
        };
        Update: {
          status?: 'new' | 'contacted' | 'closed';
        };
        Relationships: [];
      };

      xp_events: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: 'card_review' | 'perfect_review' | 'session_complete' | 'quest_daily' | 'quest_weekly' | 'achievement_unlock';
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          reason: 'card_review' | 'perfect_review' | 'session_complete' | 'quest_daily' | 'quest_weekly' | 'achievement_unlock';
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          tier: 'bronze' | 'silver' | 'gold';
          criteria_type: 'streak' | 'total_cards' | 'total_sessions' | 'level';
          criteria_value: number;
          xp_reward: number;
          sort_order: number;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };

      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      quest_templates: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          period: 'daily' | 'weekly';
          goal_type: 'cards_reviewed' | 'sessions_completed' | 'study_days';
          goal_value: number;
          xp_reward: number;
          sort_order: number;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };

      user_quest_claims: {
        Row: {
          user_id: string;
          quest_template_id: string;
          period_key: string;
          claimed_at: string;
        };
        Insert: {
          user_id: string;
          quest_template_id: string;
          period_key: string;
          claimed_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      decks: {
        Row: {
          id: string;
          owner_id: string;
          folder_id: string | null;
          name: string;
          description: string | null;
          is_public: boolean;
          publish_status: 'private' | 'pending' | 'approved' | 'rejected';
          publish_requested_at: string | null;
          publish_reviewed_by: string | null;
          publish_reviewed_at: string | null;
          card_count: number;
          search_vector: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          folder_id?: string | null;
          name: string;
          description?: string | null;
          is_public?: boolean;
          publish_status?: 'private' | 'pending' | 'approved' | 'rejected';
          publish_requested_at?: string | null;
          publish_reviewed_by?: string | null;
          publish_reviewed_at?: string | null;
          card_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          folder_id?: string | null;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          publish_status?: 'private' | 'pending' | 'approved' | 'rejected';
          publish_requested_at?: string | null;
          publish_reviewed_by?: string | null;
          publish_reviewed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'decks_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'decks_folder_id_fkey';
            columns: ['folder_id'];
            referencedRelation: 'folders';
            referencedColumns: ['id'];
          },
        ];
      };

      deck_tags: {
        Row: {
          deck_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          deck_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      flashcards: {
        Row: {
          id: string;
          deck_id: string;
          front_text: string;
          front_image_url: string | null;
          back_text: string;
          back_image_url: string | null;
          sort_order: number;
          search_vector: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          front_text: string;
          front_image_url?: string | null;
          back_text: string;
          back_image_url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          front_text?: string;
          front_image_url?: string | null;
          back_text?: string;
          back_image_url?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'flashcards_deck_id_fkey';
            columns: ['deck_id'];
            referencedRelation: 'decks';
            referencedColumns: ['id'];
          },
        ];
      };

      user_card_progress: {
        Row: {
          user_id: string;
          flashcard_id: string;
          ease_factor: number;
          interval_days: number;
          repetitions: number;
          last_reviewed_at: string | null;
          next_review_at: string;
          total_reviews: number;
          correct_reviews: number;
          last_confidence: number | null;
        };
        Insert: {
          user_id: string;
          flashcard_id: string;
          ease_factor?: number;
          interval_days?: number;
          repetitions?: number;
          last_reviewed_at?: string | null;
          next_review_at?: string;
          total_reviews?: number;
          correct_reviews?: number;
          last_confidence?: number | null;
        };
        Update: {
          ease_factor?: number;
          interval_days?: number;
          repetitions?: number;
          last_reviewed_at?: string | null;
          next_review_at?: string;
          total_reviews?: number;
          correct_reviews?: number;
          last_confidence?: number | null;
        };
        Relationships: [];
      };

      classrooms: {
        Row: {
          id: string;
          teacher_id: string;
          district_id: string | null;
          name: string;
          description: string | null;
          classroom_code: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          district_id?: string | null;
          name: string;
          description?: string | null;
          classroom_code: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          classroom_code?: string;
          is_archived?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      student_classroom_memberships: {
        Row: {
          student_id: string;
          classroom_id: string;
          joined_at: string;
        };
        Insert: {
          student_id: string;
          classroom_id: string;
          joined_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      classroom_deck_shares: {
        Row: {
          classroom_id: string;
          deck_id: string;
          shared_by_id: string;
          created_at: string;
        };
        Insert: {
          classroom_id: string;
          deck_id: string;
          shared_by_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          deck_id: string;
          started_at: string;
          ended_at: string | null;
          cards_reviewed: number;
          correct_count: number;
          total_time_seconds: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          deck_id: string;
          started_at?: string;
          ended_at?: string | null;
          cards_reviewed?: number;
          correct_count?: number;
          total_time_seconds?: number;
        };
        Update: {
          ended_at?: string | null;
          cards_reviewed?: number;
          correct_count?: number;
          total_time_seconds?: number;
        };
        Relationships: [];
      };

      audit_logs: {
        Row: {
          id: number;
          user_id: string | null;
          action_type: string;
          resource_type: string | null;
          resource_id: string | null;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          timestamp: string;
        };
        Insert: {
          user_id?: string | null;
          action_type: string;
          resource_type?: string | null;
          resource_id?: string | null;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          timestamp?: string;
        };
        Update: never;
        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: {
      auth_role: {
        Args: Record<string, never>;
        Returns: 'student' | 'teacher' | 'administrator';
      };
      auth_district_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_teacher_or_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };

    Enums: {
      user_role: 'student' | 'teacher' | 'administrator';
      account_status: 'pending' | 'approved' | 'suspended';
      district_status: 'pending' | 'approved' | 'rejected';
    };
  };
};

// Convenience helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
