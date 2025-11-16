import { EMAILS_QUEUE_NAME } from '@/common/constants';
import { EmailTemplateNameEnum } from '@/common/enums';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from '../email.service';

@Processor(EMAILS_QUEUE_NAME)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(
    job: Job<{
      email: string;
      templateName: EmailTemplateNameEnum;
      context: Record<string, any>;
    }>,
  ): Promise<any> {
    console.log(
      `Processing job '${job.name}': Sending email to '${job.data.email}'...`,
    );

    const { email, templateName, context } = job.data;

    return this.emailService.handleSendEmail(email, templateName, context);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job '${job.name}' completed.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job '${job.name} failed due to: `, err);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    if (job.attemptsMade > 0) {
      console.error(
        `Retrying job '${job.name}', attempt: ${job.attemptsMade + 1}`,
      );
    }
  }
}
