import { SurveyEditor } from "@/components/survey/SurveyEditor";

export default async function SurveyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SurveyEditor surveyId={id} />;
}
