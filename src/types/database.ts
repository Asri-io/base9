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
      products: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          price: number;
          category: string;
          sizes: string[];
          colors: string[];
          front_image: string | null;
          back_image: string | null;
          model_url: string | null;
          is_published: boolean;
          is_featured: boolean;
          stock: number;
          slug: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          price: number;
          category: string;
          sizes?: string[];
          colors?: string[];
          front_image?: string | null;
          back_image?: string | null;
          model_url?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          stock?: number;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: string;
          sizes?: string[];
          colors?: string[];
          front_image?: string | null;
          back_image?: string | null;
          model_url?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          stock?: number;
          slug?: string;
        };
      };
      designs: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          image_url: string;
          category: string;
          tags: string[];
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          image_url: string;
          category?: string;
          tags?: string[];
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string;
          category?: string;
          tags?: string[];
          is_active?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          created_at: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          whatsapp: string | null;
          address: string | null;
          items: Json;
          total: number;
          status: string;
          notes: string | null;
          custom_design_url: string | null;
          selected_design_id: string | null;
          selected_design_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          items: Json;
          total: number;
          status?: string;
          notes?: string | null;
          custom_design_url?: string | null;
          selected_design_id?: string | null;
          selected_design_url?: string | null;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          items?: Json;
          total?: number;
          status?: string;
          notes?: string | null;
          custom_design_url?: string | null;
          selected_design_id?: string | null;
          selected_design_url?: string | null;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
