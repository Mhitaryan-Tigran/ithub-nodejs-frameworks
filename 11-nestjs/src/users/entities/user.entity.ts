import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'alice@example.com' })
  email!: string;

  @ApiProperty({ example: 'Alice' })
  name!: string;

  @ApiProperty({ example: 'USER' })
  role!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
