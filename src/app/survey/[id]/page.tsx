import { SurveyFillForm } from "@/components/survey/SurveyFillForm";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SurveyFillForm surveyId={id} />;
}
