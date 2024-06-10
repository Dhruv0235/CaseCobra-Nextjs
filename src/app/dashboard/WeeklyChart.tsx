"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function WeeklyChart({
  data,
}: {
  data: { week?: string; totalSales: number; month?: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 8,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="4 4" />
        {data[0].week && <XAxis dataKey="week" />}
        {data[0].month && <XAxis dataKey="month" />}
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "totalSales") {
              return [value, "Total Sales"];
            }
            return [value, name];
          }}
        />
        <Legend
          formatter={(value) => {
            if (value === "totalSales") {
              return "Total Sales";
            }
            return value;
          }}
        />
        <Line
          type="monotone"
          dataKey="totalSales"
          stroke="#16A34A"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
