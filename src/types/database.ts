/**
 * Types de la base Supabase — alignés sur `supabase/schema.sql`.
 * Permet de typer `createClient<Database>` et toutes les requêtes.
 *
 * (Peut être régénéré plus tard via `supabase gen types typescript`.)
 */

export type Plan = 'free' | 'premium';
export type ScanKind = 'face' | 'body';
export type RoutinePeriod = 'morning' | 'evening' | 'weekly';

/** Valeur JSON arbitraire (colonnes jsonb). */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          plan: Plan;
          scan_count: number;
          created_at: string;
          // Colonnes d'onboarding (cf. supabase/schema.sql).
          onboarding_completed: boolean;
          display_name: string | null;
          age_band: string | null;
          gender: string | null;
          skin_type: string | null;
          concerns: string[];
          goal: string | null;
          sleep: string | null;
          hydration: string | null;
          activity: string | null;
          stress: string | null;
          diet: string | null;
          allergies: string[];
          current_routine: string | null;
          routine_time: string | null;
          product_pref: string | null;
          budget: string | null;
          product_gender_pref: string | null;
          language: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          plan?: Plan;
          scan_count?: number;
          created_at?: string;
          onboarding_completed?: boolean;
          display_name?: string | null;
          age_band?: string | null;
          gender?: string | null;
          skin_type?: string | null;
          concerns?: string[];
          goal?: string | null;
          sleep?: string | null;
          hydration?: string | null;
          activity?: string | null;
          stress?: string | null;
          diet?: string | null;
          allergies?: string[];
          current_routine?: string | null;
          routine_time?: string | null;
          product_pref?: string | null;
          budget?: string | null;
          product_gender_pref?: string | null;
          language?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      scans: {
        Row: {
          id: string;
          user_id: string;
          kind: ScanKind;
          image_path: string | null;
          overall_score: number | null;
          created_at: string;
          is_demo: boolean;
          /** Payload complet du scan (analyse, zones, conditions, seed). */
          data: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind?: ScanKind;
          image_path?: string | null;
          overall_score?: number | null;
          created_at?: string;
          is_demo?: boolean;
          data?: Json | null;
        };
        Update: Partial<Database['public']['Tables']['scans']['Insert']>;
        Relationships: [];
      };
      scan_points: {
        Row: {
          id: string;
          scan_id: string;
          criterion: string;
          score: number;
          x: number;
          y: number;
          explanation: string | null;
          recommendation: string | null;
        };
        Insert: {
          id?: string;
          scan_id: string;
          criterion: string;
          score: number;
          x: number;
          y: number;
          explanation?: string | null;
          recommendation?: string | null;
        };
        Update: Partial<Database['public']['Tables']['scan_points']['Insert']>;
        Relationships: [];
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          scan_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scan_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['routines']['Insert']>;
        Relationships: [];
      };
      routine_tasks: {
        Row: {
          id: string;
          routine_id: string;
          user_id: string;
          title: string;
          detail: string | null;
          period: RoutinePeriod;
          scheduled_date: string | null;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          routine_id: string;
          user_id: string;
          title: string;
          detail?: string | null;
          period: RoutinePeriod;
          scheduled_date?: string | null;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['routine_tasks']['Insert']>;
        Relationships: [];
      };
      affiliate_clicks: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          network: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          network: string;
          created_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['affiliate_clicks']['Insert']
        >;
        Relationships: [];
      };
      routine_completions: {
        Row: {
          user_id: string;
          task_id: string;
          completed_at: string;
        };
        Insert: {
          user_id: string;
          task_id: string;
          completed_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['routine_completions']['Insert']
        >;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string | null;
          price_id: string | null;
          plan_interval: string | null;
          current_period_end: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string | null;
          price_id?: string | null;
          plan_interval?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['subscriptions']['Insert']
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
