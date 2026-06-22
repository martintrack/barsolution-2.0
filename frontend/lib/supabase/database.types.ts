export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          legal_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          venue_name: string | null;
          starts_at: string;
          ends_at: string;
          status: "draft" | "active" | "closed" | "archived";
          target_margin_rate: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          venue_name?: string | null;
          starts_at: string;
          ends_at: string;
          status?: "draft" | "active" | "closed" | "archived";
          target_margin_rate?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          organization_id: string;
          sku: string | null;
          name: string;
          category: string;
          unit_size: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          sku?: string | null;
          name: string;
          category: string;
          unit_size?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      event_products: {
        Row: {
          id: string;
          event_id: string;
          product_id: string;
          starting_stock: number;
          current_stock: number;
          unit_price: number;
          unit_cost: number;
          target_sell_through: number;
          min_margin_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          product_id: string;
          starting_stock?: number;
          current_stock?: number;
          unit_price: number;
          unit_cost: number;
          target_sell_through?: number;
          min_margin_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_products"]["Insert"]>;
      };
      bar_zones: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          capacity_multiplier: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          capacity_multiplier?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bar_zones"]["Insert"]>;
      };
      sales_transactions: {
        Row: {
          id: string;
          event_id: string;
          product_id: string;
          bar_zone_id: string | null;
          quantity: number;
          unit_price: number;
          unit_cost: number;
          gross_amount: number;
          gross_margin: number;
          source: string;
          external_id: string | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          product_id: string;
          bar_zone_id?: string | null;
          quantity: number;
          unit_price: number;
          unit_cost: number;
          source?: string;
          external_id?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sales_transactions"]["Insert"]>;
      };
      inventory_movements: {
        Row: {
          id: string;
          event_id: string;
          product_id: string;
          from_bar_zone_id: string | null;
          to_bar_zone_id: string | null;
          movement_type: "opening_stock" | "restock" | "transfer_in" | "transfer_out" | "waste" | "correction";
          quantity: number;
          reason: string | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          product_id: string;
          from_bar_zone_id?: string | null;
          to_bar_zone_id?: string | null;
          movement_type: "opening_stock" | "restock" | "transfer_in" | "transfer_out" | "waste" | "correction";
          quantity: number;
          reason?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_movements"]["Insert"]>;
      };
      recommendations: {
        Row: {
          id: string;
          event_id: string;
          product_id: string | null;
          bar_zone_id: string | null;
          title: string;
          summary: string;
          priority: "low" | "medium" | "high";
          status: "pending" | "approved" | "dismissed" | "expired";
          estimated_margin: number;
          evidence: Json;
          rule_code: string;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          product_id?: string | null;
          bar_zone_id?: string | null;
          title: string;
          summary: string;
          priority?: "low" | "medium" | "high";
          status?: "pending" | "approved" | "dismissed" | "expired";
          estimated_margin?: number;
          evidence?: Json;
          rule_code: string;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["recommendations"]["Insert"]>;
      };
      simulation_runs: {
        Row: {
          id: string;
          event_id: string;
          created_by: string | null;
          name: string;
          status: "draft" | "running" | "completed" | "failed";
          assumptions: Json;
          baseline_snapshot: Json;
          result_snapshot: Json;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          created_by?: string | null;
          name: string;
          status?: "draft" | "running" | "completed" | "failed";
          assumptions?: Json;
          baseline_snapshot?: Json;
          result_snapshot?: Json;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["simulation_runs"]["Insert"]>;
      };
      simulation_actions: {
        Row: {
          id: string;
          simulation_run_id: string;
          product_id: string | null;
          bar_zone_id: string | null;
          action_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          simulation_run_id: string;
          product_id?: string | null;
          bar_zone_id?: string | null;
          action_type: string;
          payload?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["simulation_actions"]["Insert"]>;
      };
    };
  };
};
