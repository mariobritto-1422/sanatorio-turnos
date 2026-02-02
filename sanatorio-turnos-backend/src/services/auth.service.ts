import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { Rol } from '@prisma/client';

export const authService = {
  async login(email: string, password: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        paciente: { select: { id: true, nombre: true, apellido: true } },
        profesional: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    if (usuario.estado !== 'ACTIVO') {
      throw new Error('Usuario inactivo o bloqueado');
    }

    const isPasswordValid = await comparePassword(password, usuario.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        paciente: usuario.paciente,
        profesional: usuario.profesional,
      },
    };
  },

  async register(email: string, password: string, rol: Rol) {
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const passwordHash = await hashPassword(password);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        passwordHash,
        rol,
      },
      select: {
        id: true,
        email: true,
        rol: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return { token, usuario };
  },

  async getProfile(userId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        rol: true,
        estado: true,
        ultimoAcceso: true,
        createdAt: true,
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            telefono: true,
            email: true,
            obraSocial: { select: { id: true, nombre: true } },
          },
        },
        profesional: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            matricula: true,
            especialidad: true,
            telefono: true,
            email: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    return usuario;
  },
};
