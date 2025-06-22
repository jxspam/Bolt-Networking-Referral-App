export const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}

export function formatChartData(data: any[]) {
  return data.map((item, index) => ({
    ...item,
    fill: `var(--color-${Object.keys(item)[1]})`,
  }))
}

export function getChartColor(key: string) {
  const colors = {
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    success: "hsl(var(--success))",
    warning: "hsl(var(--warning))",
    danger: "hsl(var(--danger))",
  }
  return colors[key as keyof typeof colors] || "hsl(var(--primary))"
}
