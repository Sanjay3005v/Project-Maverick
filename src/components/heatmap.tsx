
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay, getDay, getMonth } from 'date-fns';

export function Heatmap({ completionDates }: { completionDates: string[] }) {
  const completionSet = new Set(completionDates);
  const today = startOfDay(new Date());
  
  const days = Array.from({ length: 365 }).map((_, i) => subDays(today, 364 - i));
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const firstDayOfWeek = getDay(days[0]);
  const emptyCells = Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />);
  
  const monthLabelPositions = days.reduce((acc, day, index) => {
    const month = getMonth(day);
    if (!acc.some(item => item.month === month)) {
      acc.push({ month: month, weekIndex: Math.floor((firstDayOfWeek + index) / 7) });
    }
    return acc;
  }, [] as { month: number, weekIndex: number }[]);


  return (
    <TooltipProvider>
      <div className="flex flex-col items-center w-full">
        {/* Month Labels */}
        <div className="grid grid-cols-53 w-full self-start text-xs text-muted-foreground mb-1">
          {monthLabelPositions.map(({ month, weekIndex }, i) => {
            const prevWeekIndex = i > 0 ? monthLabelPositions[i - 1].weekIndex : 0;
            const colSpan = weekIndex - prevWeekIndex;
            return (
              <div key={month} style={{ gridColumn: `${weekIndex + 1} / span ${colSpan}` }} className="min-w-0">
                {monthLabels[month]}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 w-full">
          {/* Day Labels */}
          <div className="grid grid-rows-7 gap-1 text-xs text-muted-foreground">
            <div className="flex items-center"><span>{weekDays[1]}</span></div>
            <div className="flex items-center"><span></span></div>
            <div className="flex items-center"><span>{weekDays[3]}</span></div>
            <div className="flex items-center"><span></span></div>
            <div className="flex items-center"><span>{weekDays[5]}</span></div>
            <div className="flex items-center"><span></span></div>
            <div className="flex items-center"><span></span></div>
          </div>
          
          {/* Heatmap Grid */}
          <div className="w-full overflow-x-auto">
            <div className="grid grid-flow-col grid-rows-7 gap-1 w-full">
              {emptyCells}
              {days.map((day) => {
                  const dateString = format(day, 'yyyy-MM-dd');
                  const hasCompleted = completionSet.has(dateString);
                  const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                  
                  const colorClass = hasCompleted ? 'bg-primary' : 'bg-muted/60';
                  const borderClass = isToday ? 'border-2 border-foreground' : 'border-transparent';

                  return (
                    <Tooltip key={dateString} delayDuration={100}>
                      <TooltipTrigger asChild>
                      <div className="aspect-square w-full rounded-sm">
                        <div
                            className={cn(
                            'h-full w-full rounded-sm',
                            colorClass,
                            borderClass
                            )}
                        />
                      </div>
                      </TooltipTrigger>
                      <TooltipContent>
                      {hasCompleted ? `Quiz completed on ${format(day, 'PPP')}` : `No quiz on ${format(day, 'PPP')}`}
                      </TooltipContent>
                    </Tooltip>
                  );
              })}
            </div>
          </div>
        </div>
         {/* Legend */}
        <div className="flex justify-end items-center gap-2 mt-2 text-xs text-muted-foreground self-end">
            <span>Less</span>
            <div className="h-3 w-3 rounded-sm bg-muted/60" />
            <div className="h-3 w-3 rounded-sm bg-primary/40" />
            <div className="h-3 w-3 rounded-sm bg-primary/70" />
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Dummy style for grid-cols-53 to be recognized by Tailwind JIT compiler. 
// The actual logic is handled by inline styles above.
const dummy = "grid-cols-1 grid-cols-2 grid-cols-3 ... grid-cols-53"
