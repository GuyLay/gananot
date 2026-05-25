export type JobStatus = "pending" | "approved" | "completed" | "cancelled";

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  customer_id: string;
  date: string;
  price: number;
  description: string | null;
  status: JobStatus;
  paid: boolean;
  recurrence_days: number | null;
  auto_generated: boolean;
  parent_job_id: string | null;
  recurring_group_id: string | null;
  is_special_job: boolean;
  source_job_id: string | null;
  created_at: string;
  customer?: Customer;
}

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: Omit<Customer, "id" | "created_at">;
        Update: Partial<Omit<Customer, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      jobs: {
        Row: Job;
        Insert: Omit<Job, "id" | "created_at" | "auto_generated" | "customer"> & { auto_generated?: boolean };
        Update: Partial<Omit<Job, "id" | "user_id" | "created_at" | "customer">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
