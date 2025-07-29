
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay, getDay } from 'date-fns';

export function Heatmap({ completionDates }: { completionDates: string[] }) {
  const completionSet = new Set(completionDates);
  const today = startOfDay(new Date());
  
  // Create an array of the last 365 days
  const days = Array.from({ length: 365 }).map((_, i) => {
    return subDays(today, 364 - i);
  });
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // The grid needs empty cells to align the first day correctly
  const firstDayOfWeek = getDay(days[0]);
  const emptyCells = Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />);

  return (
    <TooltipProvider>
      <div className="flex gap-3">
        {/* Day Labels */}
        <div className="flex flex-col justify-around text-xs text-muted-foreground">
          <span>{weekDays[1]}</span>
          <span>{weekDays[3]}</span>
          <span>{weekDays[5]}</span>
        </div>
        
        {/* Heatmap Grid */}
        <div className="flex flex-col">
            <div className="grid grid-flow-col grid-rows-7 gap-1">
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
                        <div
                            className={cn(
                            'h-3 w-3 rounded-sm',
                            colorClass,
                            borderClass
                            )}
                        />
                        </TooltipTrigger>
                        <TooltipContent>
                        {hasCompleted ? `Quiz completed on ${format(day, 'PPP')}` : `No quiz on ${format(day, 'PPP')}`}
                        </TooltipContent>
                    </Tooltip>
                    );
                })}
            </div>
             {/* Legend */}
            <div className="flex justify-end items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="h-3 w-3 rounded-sm bg-muted/60" />
                <div className="h-3 w-3 rounded-sm bg-primary/40" />
                <div className="h-3 w-3 rounded-sm bg-primary/70" />
                <div className="h-3 w-3 rounded-sm bg-primary" />
                <span>More</span>
            </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
