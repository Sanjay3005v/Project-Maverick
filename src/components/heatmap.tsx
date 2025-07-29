
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  format, 
  startOfToday, 
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  getDay,
  getMonth
} from 'date-fns';

export function Heatmap({ completionDates }: { completionDates: string[] }) {
  const completionSet = new Set(completionDates);
  const today = startOfToday();
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const days = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const daysByMonth = days.reduce((acc, day) => {
    const month = getMonth(day);
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(day);
    return acc;
  }, [] as Date[][]);

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center w-full">
        <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4">
              {daysByMonth.map((monthDays, monthIndex) => {
                if (!monthDays || monthDays.length === 0) return null;
                const firstDayOfMonth = monthDays[0];
                const startingDayOfWeek = getDay(firstDayOfMonth);
                const emptyCells = Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${monthIndex}-${i}`} />
                ));

                return (
                  <div key={monthIndex} className="flex flex-col items-center min-w-[10rem]">
                    <div className="text-sm font-medium mb-2">{monthLabels[monthIndex]}</div>
                    <div className="grid grid-cols-7 gap-1 w-full">
                      {weekDays.map((day, index) => <div key={index} className="text-xs text-muted-foreground text-center">{day}</div>)}
                      {emptyCells}
                      {monthDays.map((day) => {
                        const dateString = format(day, 'yyyy-MM-dd');
                        const hasCompleted = completionSet.has(dateString);
                        const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                        
                        const colorClass = hasCompleted ? 'bg-primary' : 'bg-muted/60';
                        const borderClass = isToday ? 'border-2 border-foreground' : 'border-transparent';

                        return (
                          <Tooltip key={dateString} delayDuration={100}>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                'aspect-square w-full rounded-sm',
                                colorClass,
                                borderClass
                              )} />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{hasCompleted ? 'Quiz completed on' : 'No quiz on'} {format(day, 'PPP')}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
