import { Module, Global } from '@nestjs/common';
import { DateUtil } from './utils/date.util';
import { PaginationUtil } from './utils/pagination.util';
import { AttendeeUtil } from './utils/attendee.util';
import { RegistrationUtil } from './utils/registration.util';

@Global()
@Module({
  providers: [
    DateUtil,
    PaginationUtil,
    AttendeeUtil,
    RegistrationUtil,
  ],
  exports: [
    DateUtil,
    PaginationUtil,
    AttendeeUtil,
    RegistrationUtil,
  ],
})
export class SharedModule {} 