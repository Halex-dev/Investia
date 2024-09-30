import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}

  async create(
    userId: string,
    name: string,
    color: string,
    type: CategoryType = CategoryType.OPTIONAL
  ): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({ where: { userId, name } });
    if (existingCategory) {
      throw new ConflictException('A category with this name already exists for this user');
    }

    const category = this.categoryRepository.create({ userId, name, color, type });
    return this.categoryRepository.save(category);
  }
  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id, userId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    id: string,
    userId: string,
    name?: string,
    color?: string,
    type?: CategoryType
  ): Promise<Category> {
    const category = await this.findOne(id, userId);

    if (name) {
      const existingCategory = await this.categoryRepository.findOne({ where: { userId, name } });
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('A category with this name already exists for this user');
      }
      category.name = name;
    }

    if (color) {
      category.color = color;
    }

    if (type) {
      category.type = type;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);
    await this.categoryRepository.remove(category);
  }

  async getOrCreateDefault(userId: string): Promise<Category> {
    let defaultCategory = await this.categoryRepository.findOne({
      where: { userId, name: 'Uncategorized' },
    });
    if (!defaultCategory) {
      defaultCategory = await this.create(
        userId,
        'Uncategorized',
        '#808080',
        CategoryType.OPTIONAL
      );
    }
    return defaultCategory;
  }
}
