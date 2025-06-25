import { intervalToDuration, formatDuration } from "date-fns";

function formatMillisecondsToDHMS(ms: number): string {
  const duration = intervalToDuration({
    start: 0,
    end: ms,
  });

  return formatDuration(duration, {
    format: ["hours", "minutes", "seconds"], // You can add "days" if needed
    zero: true,
    delimiter: " : ",
  });
}

export { formatMillisecondsToDHMS };
