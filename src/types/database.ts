/**
 * Types de la base Supabase — alignés sur `supabase/schema.sql`.
 * Permet de typer `createClient<Database>` et toutes les requêtes.
 *
 * (Peut être régénéré plus tard via `supabase gen types typescript`.)
 */

export type Plan = 'free' | 'premium';
export type ScanKind = 'face' | 'body';
export type RoutinePeriod = 'morning' | 'evening' | 'weekly';

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
        };
        Insert: {
          id?: string;
          user_id: string;
          kind?: ScanKind;
          image_path?: string | null;
          overall_score?: number | null;
          created_at?: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
