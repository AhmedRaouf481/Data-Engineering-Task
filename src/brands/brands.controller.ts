import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) { }

  @Patch('validate-and-update')
  async validateAndUpdate() {
    try {
      return await this.brandsService.validateAndUpdate();
    } catch (error) {
      throw error
    }
  }

  @Post('seed-data')
  async seedData() {
    try {
      return await this.brandsService.seedData();
    } catch (error) {
      throw error
    }
  }

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    try {
      const brand = await this.brandsService.create(createBrandDto)
      return brand;
    } catch (error) {
      console.log(error);

      throw error
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.brandsService.findAll();
    } catch (error) {
      throw error
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.brandsService.findOne(id);
    } catch (error) {
      throw error
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    try {
      return await this.brandsService.update(id, updateBrandDto);
    } catch (error) {
      throw error
    }
  }

  @Delete()
  async removeAll() {
    try {
      return await this.brandsService.removeAll();
    } catch (error) {
      throw error
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.brandsService.remove(id);
    } catch (error) {
      throw error
    }
  }
}
