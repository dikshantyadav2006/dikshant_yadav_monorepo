import { prisma } from '@dikshant/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export class AuthService {
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Create a default administrator user if none exists (for bootstrapping)
  static async seedAdminIfNeeded() {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    if (adminCount === 0) {
      const defaultEmail = 'admin@dikshantyadav.in';
      const defaultPassword = 'dikshant_secure_password_123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      
      await prisma.user.create({
        data: {
          email: defaultEmail,
          name: 'Dikshant Yadav',
          passwordHash,
          role: 'ADMIN',
        },
      });
      
      console.log(`[BOOTSTRAP] Seeded default admin user: ${defaultEmail} / ${defaultPassword}`);
    }
  }

  static async verifyCredentials(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  static generateToken(user: { id: string; email: string; role: string }) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' } // Access token valid for 7 days
    );
  }
}
