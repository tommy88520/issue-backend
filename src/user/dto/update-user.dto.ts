import { PartialType } from '@nestjs/mapped-types';
import { CreateIssue } from './create-issue.dto';

export class UpdateUserDto extends PartialType(CreateIssue) {
  issue_number: number;
}
