export class DateUtil {
  static addHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }

  static isOverlapping(
    startDate1: Date,
    startDate2: Date,
    durationHours = 1,
  ): boolean {
    const endDate1 = this.addHours(startDate1, durationHours);
    const endDate2 = this.addHours(startDate2, durationHours);

    return startDate1 < endDate2 && endDate1 > startDate2;
  }
} 