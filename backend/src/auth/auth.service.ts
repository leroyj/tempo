import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(loginDto.password, saltRounds);
    // Ajoute un log pour voir les valeurs exactes
    console.log('Mot de passe entrant:', loginDto.password);
    console.log('Hash stocké:', user.passwordHash);
    console.log('Hash généré:', hashedPassword);
    const ishashValid = await bcrypt.compare(String(loginDto.password), String(hashedPassword));
    console.log('Résultat bcrypt.compare recalculé:', ishashValid);

    const isPasswordValid = await bcrypt.compare(String(loginDto.password), String(user.passwordHash));
    console.log('Résultat bcrypt.compare stocké:', isPasswordValid);
// Ajoute ce log pour voir les caractères exacts
    console.log('Hash généré (bytes):', [...hashedPassword].map(c => c.charCodeAt(0)));
    console.log('Hash stocké (bytes):', [...user.passwordHash].map(c => c.charCodeAt(0)));    //const isPasswordValid = true; //await bcrypt.compare(loginDto.password, user.passwordHash);
// Assure-toi que les deux sont bien des strings
    console.log('Type Hash généré:', typeof hashedPassword);
    console.log('Type Hash stocké:', typeof user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('mot de passe invalide : '+String(loginDto.password)+' '+String(user.passwordHash));
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      access_token,
      user: userResponse,
    };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(userId);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

