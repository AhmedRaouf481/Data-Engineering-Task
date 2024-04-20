import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './schemas/brands-schema';
import { Model, Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import * as ExcelJS from 'exceljs'
import * as Joi from 'joi'
import { validate } from '../shared/utlis/validate';

const brandsSchema = Joi.object({
  _id: Joi.object(),
  brandName: Joi.string().required().trim(),
  headquarters: Joi.string().required().trim(),
  yearFounded: Joi.number().required().min(1600).max(new Date().getFullYear()).default(1600),
  numberOfLocations: Joi.number().required().min(1).default(1),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
  __v: Joi.number(),
})

const createBrandsSchema = Joi.object({
  brandName: Joi.string().required().trim(),
  headquarters: Joi.string().required().trim(),
  yearFounded: Joi.number().required().min(1600).max(new Date().getFullYear()).default(1600),
  numberOfLocations: Joi.number().required().min(1).default(1),
})


const updateBrandsSchema = Joi.object({
  brandName: Joi.string().trim(),
  headquarters: Joi.string().trim(),
  yearFounded: Joi.number().min(1600).max(new Date().getFullYear()).default(1600),
  numberOfLocations: Joi.number().min(1).default(1),
})


@Injectable()
export class BrandsService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<Brand>) { }

  /**
   * Check if there is mistakes in the data in database and updates it to conform to the Brands schema.
   * @returns An object containing the status code and a message indicating the outcome of the operation.
   */
  async validateAndUpdate() {
    try {
      // Fetch brands data from the database
      const brands = await this.brandModel.find().lean().exec();

      // Update brand data to conform to the schema
      let updatedBrands = this.updateToConformSchema(brands);

      // If no updates are needed, return a success message
      if (updatedBrands.length === 0) {
        return {
          statusCode: HttpStatus.OK,
          message: `All brand data is already correct. No updates needed.`
        };
      }

      // Validate each updated brand object
      updatedBrands = updatedBrands.map(brand => validate(brand, brandsSchema).value);

      // Prepare bulk update operations
      const bulkOps = updatedBrands.map((brand) => {
        const { _id, ...updates } = brand;
        return ({
          replaceOne: {
            filter: { _id },
            replacement: updates
          }
        });
      });

      // Execute bulk write operation to update brands in the database
      try {
        const bulkWriteResult = await this.brandModel.bulkWrite(bulkOps);
        return {
          statusCode: HttpStatus.OK,
          message: `${bulkWriteResult.modifiedCount} brands updated successfully.`
        };
      } catch (error) {
        console.error('Error updating brands:', error);
        throw new InternalServerErrorException()
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw new InternalServerErrorException()
    }
  }

  /**
   * Generates mock brand data adhering to the schema, documents it in an Excel file, and inserts it into the database.
   * @returns The inserted brand documents.
   */
  async seedData() {
    try {
      // Generate 10 brand documents adhering to the schema
      const brandData = this.generateBrandsData(10);

      // Document generated data in Excel file
      this.documentDataInExcel(brandData);

      // Insert generated brand data into the database
      const brands = await this.brandModel.insertMany(brandData);
      return {
        statusCode: HttpStatus.CREATED,
        message: `Generated data inserted successfully`,
        brands
      };
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw new InternalServerErrorException()
    }
  }

  // * Basic CRUD Operations
  async create(createBrandDto: CreateBrandDto) {
    try {
      const validatedBrand = validate(createBrandDto, createBrandsSchema)
      if (validatedBrand.error) {
        throw new BadRequestException(validatedBrand.error.message)
      }
      const brand = new this.brandModel(validatedBrand.value)
      return brand.save();
    } catch (error) {
      throw error
    }
  }

  async findAll() {
    try {
      const brand = await this.brandModel.find({}).exec()
      return brand
    } catch (error) {
      throw error
    }
  }

  async findOne(id: string) {
    try {
      const brand = await this.brandModel.findById(id)
      if (!brand) {
        throw new NotFoundException("Brand not found!")
      }
      return brand
    } catch (error) {
      throw error
    }
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    try {
      const validatedBrand = validate(updateBrandDto, updateBrandsSchema)
      if (validatedBrand.error) {
        throw new BadRequestException(validatedBrand.error.message)
      }
      const brand = await this.brandModel.findByIdAndUpdate(id, updateBrandDto)
      if (!brand) {
        throw new NotFoundException("Brand not found!")
      }
      return {
        statusCode: HttpStatus.OK,
        message: "Brand updateed successfully"
      }
    } catch (error) {
      throw error
    }
  }

  async remove(id: string) {
    try {
      const brand = await this.brandModel.findByIdAndDelete(id)
      if (!brand) {
        throw new NotFoundException("Brand not found!")
      }
      return {
        statusCode: HttpStatus.OK,
        message: "Brand deleted successfully"
      }
    } catch (error) {
      throw error
    }
  }
  async removeAll() {
    try {
      return await this.brandModel.deleteMany({});
    } catch (error) {
      throw error
    }
  }

  // * Helper functions:
  updateToConformSchema(brands: (Brand & { _id: Types.ObjectId })[]) {
    return brands.map((brand) => {
      // Validate the brand object 
      let validatedBrand = validate(brand, brandsSchema);

      // If there are validation errors
      if (validatedBrand.error) {
        // Iterate through each validation error
        validatedBrand.error.details.forEach((error) => {
          let { context } = error;

          // Handle validation errors related to the "yearFounded" field
          if (context.key.toLowerCase().includes('year')) {
            //  If the value is a valid number but is stored as a string
            if (!isNaN(context.value) && context.value) {
              brand.yearFounded = parseInt(context.value);
            }
            // Remove the field from the brand object (assign default value)
            delete brand[context.key];
            return;
          }

          // Handle validation errors related to the "numberOfLocations" field
          if (context.key.toLowerCase().includes('locations')) {
            //  If the value is a valid number but is stored as a string
            if (!isNaN(context.value) && context.value) {
              brand.numberOfLocations = parseInt(context.value);
            }
            // Remove the field from the brand object (assign default value)
            delete brand[context.key];
            return;
          }

          // Handle validation errors related to the "headquarters" field
          if (context.key.toLowerCase().includes('hqaddress')) {
            // If the value is not a number, update the "headquarters" field
            if (isNaN(context.value) && context.value) {
              brand.headquarters = context.value;
            }
            // Remove the erroneous field from the brand object
            delete brand[context.key];
            return;
          }

          // Handle validation errors related to the "brandname" field
          if (context.key.toLowerCase().includes('brandname')) {
            // Find the correct field name and update the "brandName" field accordingly
            let brandKey = Object.keys(validatedBrand.value).find((key) => key.toLowerCase().includes('brand'));
            brand.brandName = validatedBrand.value[brandKey]?.name;
            // Remove the erroneous field from the brand object
            delete brand[brandKey];
            return;
          }

          // Remove any other erroneous field from the brand object
          delete brand[context.key];
        });
        // Return the updated brand object
        return brand;
      }
    }).filter(Boolean); // Filter out any null values from the array (produced by the valid objects)
  }

  generateBrandsData(numberOfBrands: number) {
    const brandData: Brand[] = [];

    // Loop to generate the specified number of brand records
    for (let i = 0; i < numberOfBrands; i++) {
      // Seed the Faker.js library to ensure consistent random data generation
      faker.seed(100 + i);

      // Generate a brand object with random attributes
      const brand: Brand = {
        brandName: faker.company.name(),
        yearFounded: faker.number.int({ min: 1600, max: new Date().getFullYear() }),
        headquarters: faker.location.city(),
        numberOfLocations: faker.number.int({ min: 1, max: 100 }),
      };
      brandData.push(brand);
    }
    // Return the array of generated brand objects
    return brandData;
  }

  async documentDataInExcel(data: Brand[]) {
    try {
      // Initialize a new Excel workbook using the ExcelJS library
      const workbook = new ExcelJS.Workbook();

      // Add a worksheet named "Brand Data" to the workbook
      const worksheet = workbook.addWorksheet('Brand Data');

      // Add headers of the worksheet
      worksheet.addRow(['Brand Name', 'Year Founded', 'Headquarters', 'Number of Locations']);

      // Add brands data to the worksheet
      data.forEach((brand: Brand) => {
        worksheet.addRow([brand.brandName, brand.yearFounded, brand.headquarters, brand.numberOfLocations]);
      });

      // Save the workbook as an Excel file named "brand_data.xlsx"
      await workbook.xlsx.writeFile('brand_data.xlsx');

      return 'Data successfully written to Excel file.';
    } catch (error) {
      console.error('Error documenting data:', error);
      throw {
        statusCode: 500,
        message: "Internal Server Error"
      };
    }
  }

}
