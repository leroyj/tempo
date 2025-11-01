import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Tempo API - Gestion des temps hebdomadaire';
  }
}

