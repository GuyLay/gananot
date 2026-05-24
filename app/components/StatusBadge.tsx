import type { JobStatus } from "@/types/database";

const STATUS_LABELS: Record<JobStatus, string> = {
  pending: "ממתין",
  approved: "מאושר",
  completed: "הושלם",
  cancelled: "בוטל",
};

const STATUS_COLORS: Record<JobStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
