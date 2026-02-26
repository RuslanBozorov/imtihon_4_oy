import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/common/email/email.module';
@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'shaftoli',
      signOptions: { expiresIn: '2h' },
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
