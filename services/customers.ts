import { supabase } from "@/lib/supabase";
import type { Customer } from "@/types/database";

export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Customer[];
}

export async function getCustomer(id: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function createCustomer(name: string, phone: string) {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user!.id;

  const { data, error } = await supabase
    .from("customers")
    .insert({ name, phone, user_id })
    .select()
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, name: string, phone: string) {
  const { data, error } = await supabase
    .from("customers")
    .update({ name, phone })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Customer;
}
