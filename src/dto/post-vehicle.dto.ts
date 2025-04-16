import { IsNotEmpty, IsNumberString, IsString, IsEnum } from 'class-validator';

enum VehicleType {
  'Car' = 'Car',
  'Other' = 'Other',
}

enum PackageType {
  'Free' = 'Free',
  'Top' = 'Top',
}

enum TransactionType {
  'Fixed' = 'Fijo',
  'Negotiable' = 'Negociable',
}

export class PostVehicleDto {
  //* Other fields left to show  use case.
  // @IsEnum(VehicleType)
  // @IsNotEmpty()
  // type: VehicleType;

  // @IsString()
  // @IsNotEmpty()
  // brand: string;

  // @IsString()
  // @IsNotEmpty()
  // model: string;

  // @IsString()
  // @IsNotEmpty()
  // subtype: string;

  // @IsString()
  // @IsNotEmpty()
  // year: number;

  // @IsString()
  // @IsNotEmpty()
  // vertion: string;

  // @IsString()
  // @IsNotEmpty()
  // color: string;

  // @IsString()
  // @IsNotEmpty()
  // zipcode: string;

  // @IsString()
  // @IsNotEmpty()
  // state: string;

  // @IsString()
  // @IsNotEmpty()
  // city: string;

  // @IsNumberString()
  // @IsNotEmpty()
  // mileage: string;

  // @IsEnum(TransactionType)
  // @IsNotEmpty()
  // transaction: TransactionType;

  // @IsEnum(PackageType)
  // @IsNotEmpty()
  // package: PackageType;

  // @IsString()
  // @IsNotEmpty()
  // phonenumber: string;

  @IsNumberString()
  @IsNotEmpty()
  price: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
