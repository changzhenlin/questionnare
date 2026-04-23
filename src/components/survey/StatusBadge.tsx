import { Badge } from "@/components/ui/badge";

type SurveyStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

const statusConfig: Record<
  SurveyStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  DRAFT: { label: "草稿", variant: "secondary" },
  PUBLISHED: { label: "已发布", variant: "outline" },
  CLOSED: { label: "已结束", variant: "destructive" },
};

export function StatusBadge({ status }: { status: SurveyStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}
