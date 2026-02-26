import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriesDto } from './create.dto';
export class UpdateCategoriesDto extends PartialType(CreateCategoriesDto) {}
