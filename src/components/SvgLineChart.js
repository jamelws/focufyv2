"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function SvgLineChart({ data, timestamps }) {
  const chartData = data.map((value, index) => ({
    time: timestamps[index],
    retention: value,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="time" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip />
        <Line type="monotone" dataKey="retention" stroke="#3b82f6" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
