## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Configuration

1. MongoDB Setup:
   - Ensure that MongoDB is installed and running on your machine.
   - Update the MongoDB connection URI in the `.env` file.

2. Environment Variables:
   - Copy the `.env.example` file and rename it to `.env`.
   - Update the environment variables in the `.env` file as per your configuration.

## Usage

1. Start the NestJS application:

   ```bash
   npm start
   ```


## Features

- **Data Validation:** Validate brand records in the database against the schema defined in the Brands collection.
- **Update Operations:** Update brand records that do not conform to the schema to ensure data consistency and integrity.
- **Seed Data:** Generate and insert seed data into the database.
- **CRUD Operations:** Implement basic CRUD (Create, Read, Update, Delete) functionality, allowing for easy manipulation and retrieval of data.

## Folder Structure

The Brands module follows the standard NestJS application structure:

```
src/
|-- brands/
|   |-- dto/             # Data Transfer Objects
|   |-- schemas/         # Mongoose Schemas
|   |-- brands.controller.ts
|   |-- brands.module.ts
|   |-- brands.service.ts
|-- shared/
|   |-- filters/       
|   |-- utlis/         
|-- app.module.ts        # Root Module
|-- main.ts              # Application Entry Point
```

## Dependencies

- [NestJS](https://nestjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [FakerJS](https://fakerjs.dev/)
