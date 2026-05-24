import { supabase } from "@/lib/supabase";
import type { Job, JobStatus } from "@/types/database";
import { addDays, getDay } from "date-fns";

function applyWeekendRule(date: Date): Date {
  const day = getDay(date); // 0=Sun,1=Mon,...,5=Fri,6=Sat
  if (day === 5) return addDays(date, 2); // Fri → Sun
  if (day === 6) return addDays(date, 1); // Sat → Sun
  return date;
}

export async function getJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, customer:customers(*)")
    .order("date", { ascending: true });
  if (error) throw error;
  return data as Job[];
}

export async function getJob(id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, customer:customers(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Job;
}

export async function getJobsByStatus(status: JobStatus) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, customer:customers(*)")
    .eq("status", status)
    .order("date", { ascending: true });
  if (error) throw error;
  return data as Job[];
}

export async function getUnpaidJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, customer:customers(*)")
    .eq("paid", false)
    .order("date", { ascending: true });
  if (error) throw error;
  return data as Job[];
}

export async function toggleJobPaid(id: string, paid: boolean) {
  const { data, error } = await supabase
    .from("jobs")
    .update({ paid })
    .eq("id", id)
    .select("*, customer:customers(*)")
    .single();
  if (error) throw error;
  return data as Job;
}

export async function getJobsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, customer:customers(*)")
    .eq("customer_id", customerId)
    .order("date", { ascending: true });
  if (error) throw error;
  return data as Job[];
}

export async function createJob(job: {
  customer_id: string;
  date: string;
  price: number;
  description?: string;
  recurrence_days?: number;
}) {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user!.id;

  const { data, error } = await supabase
    .from("jobs")
    .insert({ ...job, user_id, status: "approved", auto_generated: false })
    .select()
    .single();
  if (error) throw error;
  return data as Job;
}

export async function updateJob(id: string, updates: Partial<Job>) {
  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Job;
}

export async function changeJobStatus(job: Job, newStatus: JobStatus) {
  await updateJob(job.id, { status: newStatus });

  if (newStatus === "completed" && job.recurrence_days) {
    const nextDate = applyWeekendRule(
      addDays(new Date(job.date), job.recurrence_days)
    );

    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user!.id;

    await supabase.from("jobs").insert({
      user_id,
      customer_id: job.customer_id,
      date: nextDate.toISOString(),
      price: job.price,
      description: job.description,
      recurrence_days: job.recurrence_days,
      status: "pending",
      auto_generated: true,
      parent_job_id: job.id,
      recurring_group_id: job.recurring_group_id ?? job.id,
    });
  }
}

export async function deleteJob(id: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
}
