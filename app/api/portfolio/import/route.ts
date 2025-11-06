/**
 * Portfolio Import API Endpoint
 *
 * Handles importing portfolio data from various formats (CSV, JSON)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ImportHolding {
  token: string;
  amount: number;
  avgPrice: number;
  exchange?: string;
  notes?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  holdings: ImportHolding[];
}

/**
 * POST /api/portfolio/import
 * Import portfolio holdings from CSV or JSON
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    let holdings: ImportHolding[] = [];
    let errors: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      // Handle CSV file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      if (!file.name.toLowerCase().endsWith('.csv')) {
        return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 });
      }

      const csvContent = await file.text();
      const result = parseCSV(csvContent);
      holdings = result.holdings;
      errors = result.errors;

    } else if (contentType.includes('application/json')) {
      // Handle JSON import
      const body = await request.json();
      holdings = body.holdings || [];
      errors = validateHoldings(holdings);

    } else {
      return NextResponse.json({
        error: 'Unsupported content type. Use multipart/form-data for CSV or application/json for JSON'
      }, { status: 400 });
    }

    if (errors.length > 0 && holdings.length === 0) {
      return NextResponse.json({
        error: 'No valid holdings found',
        details: errors
      }, { status: 400 });
    }

    // Get or create portfolio
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id }
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId: session.user.id }
      });
    }

    // Import holdings
    const importResult = await importHoldings(portfolio.id, holdings);

    const result: ImportResult = {
      success: importResult.errors.length === 0,
      imported: importResult.imported,
      skipped: importResult.skipped,
      errors: [...errors, ...importResult.errors],
      holdings: importResult.holdings
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error importing portfolio:', error);
    return NextResponse.json({ error: 'Failed to import portfolio' }, { status: 500 });
  }
}

/**
 * Parse CSV content into holdings array
 */
function parseCSV(csvContent: string): { holdings: ImportHolding[]; errors: string[] } {
  const holdings: ImportHolding[] = [];
  const errors: string[] = [];

  try {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      errors.push('CSV must have at least a header row and one data row');
      return { holdings, errors };
    }

    // Parse header row
    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const tokenIndex = header.findIndex(h => h.includes('token') || h.includes('symbol') || h.includes('coin'));
    const amountIndex = header.findIndex(h => h.includes('amount') || h.includes('quantity') || h.includes('qty'));
    const priceIndex = header.findIndex(h => h.includes('price') || h.includes('avg') || h.includes('cost'));
    const exchangeIndex = header.findIndex(h => h.includes('exchange') || h.includes('platform'));

    if (tokenIndex === -1 || amountIndex === -1 || priceIndex === -1) {
      errors.push('CSV must contain columns for token/symbol, amount/quantity, and price/avg cost');
      return { holdings, errors };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',').map(c => c.trim().replace(/"/g, ''));

      try {
        const token = columns[tokenIndex]?.toUpperCase();
        const amount = parseFloat(columns[amountIndex]);
        const avgPrice = parseFloat(columns[priceIndex]);
        const exchange = exchangeIndex !== -1 ? columns[exchangeIndex] : undefined;

        if (!token || isNaN(amount) || isNaN(avgPrice)) {
          errors.push(`Invalid data in row ${i + 1}: token=${token}, amount=${amount}, price=${avgPrice}`);
          continue;
        }

        if (amount <= 0 || avgPrice <= 0) {
          errors.push(`Invalid values in row ${i + 1}: amount and price must be positive`);
          continue;
        }

        holdings.push({
          token,
          amount,
          avgPrice,
          exchange,
          notes: `Imported from CSV row ${i + 1}`
        });
      } catch (error) {
        errors.push(`Error parsing row ${i + 1}: ${error}`);
      }
    }
  } catch (error) {
    errors.push(`Error parsing CSV: ${error}`);
  }

  return { holdings, errors };
}

/**
 * Validate holdings array
 */
function validateHoldings(holdings: any[]): string[] {
  const errors: string[] = [];

  if (!Array.isArray(holdings)) {
    errors.push('Holdings must be an array');
    return errors;
  }

  holdings.forEach((holding, index) => {
    if (!holding.token || typeof holding.amount !== 'number' || typeof holding.avgPrice !== 'number') {
      errors.push(`Holding ${index + 1}: must have token (string), amount (number), and avgPrice (number)`);
    } else if (holding.amount <= 0 || holding.avgPrice <= 0) {
      errors.push(`Holding ${index + 1}: amount and avgPrice must be positive numbers`);
    }
  });

  return errors;
}

/**
 * Import holdings into database
 */
async function importHoldings(portfolioId: string, holdings: ImportHolding[]): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
  holdings: ImportHolding[];
}> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  const importedHoldings: ImportHolding[] = [];

  for (const holding of holdings) {
    try {
      // Check if holding already exists
      const existing = await prisma.portfolioHolding.findUnique({
        where: {
          portfolioId_token: {
            portfolioId,
            token: holding.token
          }
        }
      });

      if (existing) {
        skipped++;
        errors.push(`Holding for ${holding.token} already exists, skipped`);
        continue;
      }

      // Create new holding
      await prisma.portfolioHolding.create({
        data: {
          portfolioId,
          token: holding.token,
          amount: holding.amount,
          avgPrice: holding.avgPrice
        }
      });

      imported++;
      importedHoldings.push(holding);
    } catch (error) {
      errors.push(`Failed to import ${holding.token}: ${error}`);
    }
  }

  return { imported, skipped, errors, holdings: importedHoldings };
}