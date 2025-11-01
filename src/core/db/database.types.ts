export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      cal_com_tokens: {
        Row: {
          id: string;
          user_id: string;
          access_token: string;
          refresh_token: string | null;
          token_type: string | null;
          expires_at: string | null;
          scope: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          access_token: string;
          refresh_token?: string | null;
          token_type?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          access_token?: string;
          refresh_token?: string | null;
          token_type?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cal_com_tokens_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      calendar_events: {
        Row: {
          id: string;
          cal_com_event_id: string;
          salon_id: string | null;
          client_id: string | null;
          pet_id: string | null;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          duration_minutes: number | null;
          status: string | null;
          attendee_email: string | null;
          attendee_phone: string | null;
          location: string | null;
          meeting_url: string | null;
          created_at: string | null;
          updated_at: string | null;
          synced_at: string | null;
        };
        Insert: {
          id?: string;
          cal_com_event_id: string;
          salon_id?: string | null;
          client_id?: string | null;
          pet_id?: string | null;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          duration_minutes?: number | null;
          status?: string | null;
          attendee_email?: string | null;
          attendee_phone?: string | null;
          location?: string | null;
          meeting_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          synced_at?: string | null;
        };
        Update: {
          id?: string;
          cal_com_event_id?: string;
          salon_id?: string | null;
          client_id?: string | null;
          pet_id?: string | null;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          duration_minutes?: number | null;
          status?: string | null;
          attendee_email?: string | null;
          attendee_phone?: string | null;
          location?: string | null;
          meeting_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          synced_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'calendar_events_salon_id_fkey';
            columns: ['salon_id'];
            isOneToOne: false;
            referencedRelation: 'salons';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'calendar_events_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'calendar_events_pet_id_fkey';
            columns: ['pet_id'];
            isOneToOne: false;
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          }
        ];
      };
      client_pets: {
        Row: {
          client_id: string;
          pet_id: string;
        };
        Insert: {
          client_id: string;
          pet_id: string;
        };
        Update: {
          client_id?: string;
          pet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'client_pets_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'client_pets_pet_id_fkey';
            columns: ['pet_id'];
            isOneToOne: false;
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          }
        ];
      };
      clients: {
        Row: {
          address: string | null;
          created_at: string;
          email: string | null;
          gdpr_consent_date: string | null;
          has_gdpr_consent: boolean;
          id: string;
          name: string;
          phone_number: string;
          salon_id: string | null;
          surname: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          gdpr_consent_date?: string | null;
          has_gdpr_consent?: boolean;
          id?: string;
          name: string;
          phone_number: string;
          salon_id?: string | null;
          surname: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          gdpr_consent_date?: string | null;
          has_gdpr_consent?: boolean;
          id?: string;
          name?: string;
          phone_number?: string;
          salon_id?: string | null;
          surname?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'clients_salon_id_fkey';
            columns: ['salon_id'];
            isOneToOne: false;
            referencedRelation: 'salons';
            referencedColumns: ['id'];
          }
        ];
      };
      pet_visits: {
        Row: {
          created_at: string;
          id: string;
          notes: string;
          pet_id: string | null;
          photos: Json | null;
          salon_id: string | null;
          updated_at: string;
          visit_date: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes: string;
          pet_id?: string | null;
          photos?: Json | null;
          salon_id?: string | null;
          updated_at?: string;
          visit_date: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string;
          pet_id?: string | null;
          photos?: Json | null;
          salon_id?: string | null;
          updated_at?: string;
          visit_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pet_visits_pet_id_fkey';
            columns: ['pet_id'];
            isOneToOne: false;
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pet_visits_salon_id_fkey';
            columns: ['salon_id'];
            isOneToOne: false;
            referencedRelation: 'salons';
            referencedColumns: ['id'];
          }
        ];
      };
      pets: {
        Row: {
          age: number | null;
          allergies: string | null;
          breed: string | null;
          created_at: string;
          health_issues: string | null;
          id: string;
          name: string;
          notes: string | null;
          preferences: string | null;
          salon_id: string | null;
          type: string | null;
        };
        Insert: {
          age?: number | null;
          allergies?: string | null;
          breed?: string | null;
          created_at?: string;
          health_issues?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          preferences?: string | null;
          salon_id?: string | null;
          type?: string | null;
        };
        Update: {
          age?: number | null;
          allergies?: string | null;
          breed?: string | null;
          created_at?: string;
          health_issues?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          preferences?: string | null;
          salon_id?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'pets_salon_id_fkey';
            columns: ['salon_id'];
            isOneToOne: false;
            referencedRelation: 'salons';
            referencedColumns: ['id'];
          }
        ];
      };
      salons: {
        Row: {
          address: string | null;
          cal_com_username: string | null;
          created_at: string | null;
          id: string;
          name: string;
          nip: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          address?: string | null;
          cal_com_username?: string | null;
          created_at?: string | null;
          id?: string;
          name: string;
          nip?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          address?: string | null;
          cal_com_username?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          nip?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      webhook_logs: {
        Row: {
          id: string;
          salon_id: string | null;
          webhook_type: string;
          payload: Json;
          status: string;
          error_message: string | null;
          processed_at: string | null;
          cal_com_event_id: string | null;
        };
        Insert: {
          id?: string;
          salon_id?: string | null;
          webhook_type: string;
          payload: Json;
          status?: string;
          error_message?: string | null;
          processed_at?: string | null;
          cal_com_event_id?: string | null;
        };
        Update: {
          id?: string;
          salon_id?: string | null;
          webhook_type?: string;
          payload?: Json;
          status?: string;
          error_message?: string | null;
          processed_at?: string | null;
          cal_com_event_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'webhook_logs_salon_id_fkey';
            columns: ['salon_id'];
            isOneToOne: false;
            referencedRelation: 'salons';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
      DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
