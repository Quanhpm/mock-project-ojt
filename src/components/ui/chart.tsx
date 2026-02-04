import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/utils/cn.ts"

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    color?: string
    icon?: React.ComponentType
  } & Record<string, any>
}

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ id: _id, className, children, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-default-tooltip]:border-border [&_.recharts-default-tooltip]:bg-background [&_.recharts-default-tooltip]:text-foreground [&_.recharts-reference-line-line]:stroke-border [&_.recharts-surface]:overflow-visible",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hideLabel?: boolean
    hideNameKey?: boolean
    indicator?: "line" | "dot" | "dashed"
    labelKey?: string
  } & any
>(
  (
    {
      active,
      payload,
      hideLabel = false,
      hideNameKey = false,
      indicator = "dot",
      labelKey,
      className,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.[0]) {
        return null
      }

      const [item] = payload as any
      const key = `${labelKey || "value"}`
      const itemConfig = config[item.dataKey as keyof typeof config]
      const value =
        !hideNameKey && item.name ? item.name : itemConfig?.label

      if (item.payload[key]) {
        return `${item.payload[key]}`
      }

      return value
    }, [config, hideLabel, hideNameKey, labelKey, payload])

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!hideLabel && tooltipLabel ? (
          <div className="text-muted-foreground">{tooltipLabel}</div>
        ) : null}
        <div className="grid gap-1.5">
          {(payload as any[]).map((item: any, index: number) => {
            const key = `color`
            const itemConfig = config[item.dataKey as keyof typeof config]
            const indicatorColor =
              item.payload[key] || itemConfig?.color || CHART_COLORS[index]

            return (
              <div
                key={`${item.dataKey}-${index}`}
                className="flex w-full flex-nowrap items-center gap-1.5"
              >
                {indicator === "dot" ? (
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: indicatorColor,
                    }}
                  />
                ) : indicator === "line" ? (
                  <div
                    className="h-2 w-4 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: indicatorColor,
                    }}
                  />
                ) : indicator === "dashed" ? (
                  <div
                    className="h-1 w-4 shrink-0 rounded-[2px]"
                    style={{
                      backgroundImage: `repeating-linear-gradient(to right, ${indicatorColor}, ${indicatorColor} 2px, transparent 2px, transparent 5px)`,
                    }}
                  />
                ) : null}
                <span className="flex w-full justify-between gap-8">
                  <span className="text-muted-foreground">
                    {!hideNameKey && item.name
                      ? item.name
                      : itemConfig?.label}
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {item.value}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart }
export type { ChartConfig }
