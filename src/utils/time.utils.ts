// utils/time.utils.ts
export class TimeUtils {
    static readonly SECOND = 1000;
    static readonly MINUTE = this.SECOND * 60;
    static readonly HOUR = this.MINUTE * 60;
    static readonly DAY = this.HOUR * 24;
    static readonly WEEK = this.DAY * 7;
  
    static sleep(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    static getExpiryTime(duration: number): Date {
      return new Date(Date.now() + duration);
    }
  
    static isExpired(date: Date): boolean {
      return date.getTime() < Date.now();
    }
  
    static formatDuration(ms: number): string {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  
    static parseDateTime(dateString: string): Date {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return date;
    }
  }