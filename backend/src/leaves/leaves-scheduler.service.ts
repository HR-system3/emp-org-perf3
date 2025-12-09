import { Injectable, Logger } from '@nestjs/common';
import { LeavesService } from './leaves.service';

/**
 * Scheduler service for leaves module
 * Handles periodic tasks like accrual and carry-over
 * 
 * Note: To enable automatic scheduling, install @nestjs/schedule:
 * npm install @nestjs/schedule
 * 
 * Then uncomment the @Cron decorators below
 */
@Injectable()
export class LeavesSchedulerService {
  private readonly logger = new Logger(LeavesSchedulerService.name);

  constructor(private readonly leavesService: LeavesService) {}

  /**
   * Process monthly accrual
   * Runs on the 1st of each month at 2 AM
   */
  // @Cron('0 2 1 * *')
  async processMonthlyAccrual() {
    this.logger.log('Processing monthly accrual...');
    try {
      await this.leavesService.processAccrual();
      this.logger.log('Monthly accrual processed successfully');
    } catch (error) {
      this.logger.error('Error processing monthly accrual', error);
    }
  }

  /**
   * Process quarterly accrual
   * Runs on the 1st of Jan, Apr, Jul, Oct at 3 AM
   */
  // @Cron('0 3 1 1,4,7,10 *')
  async processQuarterlyAccrual() {
    this.logger.log('Processing quarterly accrual...');
    try {
      await this.leavesService.processAccrual();
      this.logger.log('Quarterly accrual processed successfully');
    } catch (error) {
      this.logger.error('Error processing quarterly accrual', error);
    }
  }

  /**
   * Process yearly accrual
   * Runs on January 1st at 4 AM
   */
  // @Cron('0 4 1 1 *')
  async processYearlyAccrual() {
    this.logger.log('Processing yearly accrual...');
    try {
      await this.leavesService.processAccrual();
      this.logger.log('Yearly accrual processed successfully');
    } catch (error) {
      this.logger.error('Error processing yearly accrual', error);
    }
  }

  /**
   * Process carry-over at year end
   * Runs on December 31st at 11:59 PM
   */
  // @Cron('59 23 31 12 *')
  async processYearEndCarryOver() {
    this.logger.log('Processing year-end carry-over...');
    try {
      const currentYear = new Date().getFullYear();
      await this.leavesService.processCarryOver(currentYear);
      this.logger.log('Year-end carry-over processed successfully');
    } catch (error) {
      this.logger.error('Error processing year-end carry-over', error);
    }
  }

  /**
   * Manual trigger for accrual (for testing or manual execution)
   */
  async triggerAccrual(employeeId?: string) {
    this.logger.log(`Manually triggering accrual${employeeId ? ` for employee ${employeeId}` : ' for all employees'}`);
    await this.leavesService.processAccrual(
      employeeId ? (employeeId as any) : undefined,
    );
  }

  /**
   * Manual trigger for carry-over (for testing or manual execution)
   */
  async triggerCarryOver(year?: number) {
    this.logger.log(`Manually triggering carry-over${year ? ` for year ${year}` : ' for current year'}`);
    await this.leavesService.processCarryOver(year);
  }

  /**
   * Process auto-escalations
   * Runs every hour to check for pending requests that need escalation
   */
  // @Cron('0 * * * *') // Every hour
  async processAutoEscalations() {
    this.logger.log('Processing auto-escalations...');
    try {
      await this.leavesService.processEscalations();
      this.logger.log('Auto-escalations processed successfully');
    } catch (error) {
      this.logger.error('Error processing auto-escalations', error);
    }
  }

  /**
   * Manual trigger for escalations (for testing or manual execution)
   */
  async triggerEscalations() {
    this.logger.log('Manually triggering escalations');
    await this.leavesService.processEscalations();
  }
}

