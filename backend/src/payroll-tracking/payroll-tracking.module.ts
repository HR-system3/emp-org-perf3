import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Models
import { refunds, refundsSchema } from './models/refunds.schema';
import { Claim, ClaimSchema } from './models/claims.schema';
import { Dispute, DisputeSchema } from './models/disputes.schema';

// Controllers
import { RefundsController } from './refund.controller';
import { DisputesController } from './disputes.controller';

// Services
import { RefundsService } from './refund.service';
import { DisputesService } from './disputes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: refunds.name, schema: refundsSchema },
      { name: Dispute.name, schema: DisputeSchema },
      { name: Claim.name, schema: ClaimSchema },
    ]),
  ],
  controllers: [
    RefundsController,
    DisputesController,
  ],
  providers: [
    RefundsService,
    DisputesService,
  ],
  exports: [
    RefundsService,
    DisputesService,
  ],
})
export class PayrollTrackingModule {}