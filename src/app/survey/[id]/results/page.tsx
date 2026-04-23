import { SurveyStats } from "@/components/stats/SurveyStats";

export default async function SurveyResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SurveyStats surveyId={id} />;
}
