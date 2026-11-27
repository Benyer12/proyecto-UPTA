import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export interface SystemConfigPayload {
  localDbEnabled: boolean;
  modeName: 'PLUS' | 'CLOUD_ONLY';
  updatedAt: string | null;
  updatedBy: string;
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'system-config.json');

const DEFAULT_CONFIG: SystemConfigPayload = {
  localDbEnabled: true,
  modeName: 'PLUS',
  updatedAt: null,
  updatedBy: 'system',
};

async function readSystemConfig(): Promise<SystemConfigPayload> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SystemConfigPayload>;
    const localDbEnabled = parsed.localDbEnabled !== false;
    return {
      localDbEnabled,
      modeName: localDbEnabled ? 'PLUS' : 'CLOUD_ONLY',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      updatedBy: typeof parsed.updatedBy === 'string' && parsed.updatedBy ? parsed.updatedBy : 'system',
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function GET() {
  const config = await readSystemConfig();
  return NextResponse.json({
    ok: true,
    config,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = String(body?.role || '').trim().toLowerCase();

    if (role !== 'admin') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Solo el Administrador puede cambiar el modo de base de datos local u offline.',
        },
        { status: 403 },
      );
    }

    const localDbEnabled = Boolean(body?.localDbEnabled);
    const updatedBy =
      String(body?.updatedBy || '').trim() || 'Administrador';

    const config: SystemConfigPayload = {
      localDbEnabled,
      modeName: localDbEnabled ? 'PLUS' : 'CLOUD_ONLY',
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    let persistedOnDisk = false;
    try {
      await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
      await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      persistedOnDisk = true;
    } catch {
      persistedOnDisk = false;
    }

    return NextResponse.json({
      ok: true,
      persistedOnDisk,
      config,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Error guardando configuración del sistema.',
      },
      { status: 500 },
    );
  }
}
