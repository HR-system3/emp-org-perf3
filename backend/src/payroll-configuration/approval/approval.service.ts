import { Injectable } from '@nestjs/common';

@Injectable()
export class ApprovalService {
  async approve(dto: { type: string; id: string }) {
    return { message: `Approved ${dto.type} with ID ${dto.id}` };
  }
}