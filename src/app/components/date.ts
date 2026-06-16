import { format } from 'date-fns';

export function getNextScheduleValue() {
    const now = new Date();
    const remainder = 15 - (now.getMinutes() % 15);
    const nextSlot = new Date(now.getTime() + (remainder + 15) * 60000);
    nextSlot.setSeconds(0, 0);
    return format(nextSlot, "yyyy-MM-dd'T'HH:mm");
}

export function formatPostTime(value: string) {
    return format(new Date(value), 'M/d HH:mm');
}
