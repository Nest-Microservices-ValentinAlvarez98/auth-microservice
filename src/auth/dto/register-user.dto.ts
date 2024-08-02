import { IsEmail, IsString, IsStrongPassword, Length } from "class-validator";


export class RegisterUserDto {

      @IsString()
      @Length(3, 20)
      first_name: string;

      @IsString()
      @Length(3, 20)
      last_name: string;

      @IsString()
      @IsEmail()
      email: string;

      @IsString()
      @IsStrongPassword()
      password: string;

      @IsString()
      @IsStrongPassword()
      confirm_password: string;

}
