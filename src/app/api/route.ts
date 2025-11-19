/**
 * Simplified Ghana PCA AI API
 * Temporarily removes complex services for deployment
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { db } from '@/lib/db';

// API Request/Response schemas
const CreateAuditCaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  config: z.object({
    scope: z.enum(['all', 'hs-codes', 'shipments', 'declarations']),
    targetFilters: z.object({
      hsCodes: z.array(z.string()).optional(),
      shipmentIds: z.array(z.string()).optional(),
      declarationIds: z.array(z.string()).optional(),
      dateRange: z.object({
        start: z.string(),
        end: z.string(),
      }).optional(),
      countries: z.array(z.string()).optional(),
      riskThreshold: z.number().optional(),
      sectors: z.array(z.string()).optional(),
    }),
  }),
});

export type CreateAuditCase = z.infer<typeof CreateAuditCaseSchema>;

// Main API handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    switch (endpoint) {
      case 'health':
        return NextResponse.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          services: {
            database: 'connected',
            api: 'operational',
          },
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        });

      case 'audit-cases':
        try {
          const auditCases = await db.auditCase.findMany({
            include: {
              reports: true,
              createdBy: {
                select: { id: true, name: true, email: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          });

          return NextResponse.json({
            success: true,
            data: auditCases,
            count: auditCases.length,
          });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch audit cases', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json({
          message: "Ghana PCA AI API",
          version: "1.0.0",
          endpoints: [
            'health',
            'audit-cases',
            'create-audit-case',
          ],
          methods: ['GET', 'POST']
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const body = await request.json();

    switch (endpoint) {
      case 'create-audit-case':
        try {
          const validatedData = CreateAuditCaseSchema.parse(body);
          
          // Create audit case in database
          const auditCase = await db.auditCase.create({
            data: {
              name: validatedData.name,
              description: validatedData.description,
              config: validatedData.config,
              status: 'created',
              createdById: 'default-user', // In real app, get from auth
            },
            include: {
              reports: true,
              createdBy: {
                select: { id: true, name: true, email: true }
              }
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Audit case created successfully',
            data: auditCase,
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { error: 'Validation error', details: error.errors },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { error: 'Failed to create audit case', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}