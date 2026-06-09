// pipes/duration-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'durationFormat' })
export class DurationFormatPipe implements PipeTransform {
  transform(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
