import { Module, Global } from '@nestjs/common';
import { DateUtil } from './utils/date.util';
import { PaginationUtil } from './utils/pagination.util';

@Global()
@Module({
  providers: [DateUtil, PaginationUtil],
  exports: [DateUtil, PaginationUtil],
})
export class SharedModule {} 