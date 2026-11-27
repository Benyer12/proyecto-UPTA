import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export interface SystemConfigPayload {
  localDbEnabled: boolean;
  modeName: 'PLUS' | 'CLOUD_ONLY';
  designMode: 'original' | 'eco';
  updatedAt: string | null;
  updatedBy: string;
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'system-config.json');

const DEFAULT_CONFIG: SystemConfigPayload = {
  localDbEnabled: true,
  modeName: 'PLUS',
  designMode: 'original',
  updatedAt: null,
  updatedBy: 'system',
};

let memorySystemConfig: SystemConfigPayload | null = null;

async function readSystemConfig(): Promise<SystemConfigPayload> {
  if (memorySystemConfig) {
    return memorySystemConfig;
  }
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SystemConfigPayload>;
    const localDbEnabled = parsed.localDbEnabled !== false;
    const designMode = parsed.designMode === 'eco' ? 'eco' : 'original';
    const loaded: SystemConfigPayload = {
      localDbEnabled,
      modeName: localDbEnabled ? 'PLUS' : 'CLOUD_ONLY',
      designMode,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      updatedBy: typeof parsed.updatedBy === 'string' && parsed.updatedBy ? parsed.updatedBy : 'system',
    };
    memorySystemConfig = loaded;
    return loaded;
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
          error: 'Solo el Administrador puede cambiar la configuración global de la plataforma.',
        },
        { status: 403 },
      );
    }

    const prev = await readSystemConfig();
    const localDbEnabled =
      typeof body?.localDbEnabled === 'boolean'
        ? body.localDbEnabled
        : prev.localDbEnabled;
    const designMode: 'original' | 'eco' =
      body?.designMode === 'eco' || body?.designMode === 'original'
        ? body.designMode
        : prev.designMode;

    const updatedBy =
      String(body?.updatedBy || '').trim() || 'Administrador';

    const config: SystemConfigPayload = {
      localDbEnabled,
      modeName: localDbEnabled ? 'PLUS' : 'CLOUD_ONLY',
      designMode,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    memorySystemConfig = config;

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
