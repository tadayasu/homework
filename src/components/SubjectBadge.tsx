import { Subject } from "@/types/homework"
import { SUBJECT_COLORS } from "@/lib/constants"

interface SubjectBadgeProps {
  subject: Subject
  className?: string
}

export default function SubjectBadge({ subject, className = "" }: SubjectBadgeProps) {
  const colorClass = SUBJECT_COLORS[subject] ?? "bg-gray-100 text-gray-800"

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${colorClass} ${className}`}
    >
      {subject}
    </span>
  )
}
