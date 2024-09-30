import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { User } from '@shared/decorators/user.decorator';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

import { AuthGuard } from '@nestjs/passport';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(
    @User('id') userId: string,
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<Category> {
    return this.categoryService.create(
      userId,
      createCategoryDto.name,
      createCategoryDto.color,
      createCategoryDto.type
    );
  }

  @Get()
  findAll(@User('id') userId: string): Promise<Category[]> {
    return this.categoryService.findAll(userId);
  }

  @Get(':id')
  findOne(@User('id') userId: string, @Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    return this.categoryService.update(
      id,
      userId,
      updateCategoryDto.name,
      updateCategoryDto.color,
      updateCategoryDto.type
    );
  }

  @Delete(':id')
  remove(@User('id') userId: string, @Param('id') id: string): Promise<void> {
    return this.categoryService.remove(id, userId);
  }
}
