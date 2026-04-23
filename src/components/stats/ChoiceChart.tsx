"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface OptionStat {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

interface ChoiceChartProps {
  options: OptionStat[];
  totalResponses: number;
}

export function ChoiceChart({ options, totalResponses }: ChoiceChartProps) {
  const data = options.map((o) => ({
    name: o.text,
    count: o.count,
    percentage: o.percentage,
  }));

  const maxCount = Math.max(...options.map((o) => o.count), 1);

  return (
    <div className="space-y-3">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={{ stroke: "#e4e4e7" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, maxCount]}
            />
            <Tooltip
              formatter={(value, _name, props) => {
                const payload = props?.payload as { percentage: number } | undefined;
                const pct = payload?.percentage ?? 0;
                return [`${value} 票 (${pct}%)`, "票数"];
              }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#18181b" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-1.5">
        {options.map((opt) => (
          <div key={opt.optionId} className="flex items-center justify-between text-sm">
            <span className="text-zinc-700">{opt.text}</span>
            <span className="text-zinc-500">
              {opt.count} 票 ({opt.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
