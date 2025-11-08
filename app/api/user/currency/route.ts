import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

interface CurrencySettings {
  selectedCurrency?: string;
  displayFormat?: 'symbol' | 'code';
  thousandsSeparator?: boolean;
  decimalPlaces?: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch currency settings from database
    // For now, return default settings
    const defaultSettings: CurrencySettings = {
      selectedCurrency: 'USD',
      displayFormat: 'symbol',
      thousandsSeparator: true,
      decimalPlaces: 2,
    };

    return NextResponse.json({ settings: defaultSettings });
  } catch (error) {
    console.error('Error fetching currency settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currencySettings: CurrencySettings = await request.json();

    // Basic validation
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH', 'BNB', 'ADA', 'SOL'];
    if (currencySettings.selectedCurrency && !validCurrencies.includes(currencySettings.selectedCurrency)) {
      return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 });
    }

    if (currencySettings.displayFormat && !['symbol', 'code'].includes(currencySettings.displayFormat)) {
      return NextResponse.json({ error: 'Invalid display format' }, { status: 400 });
    }

    if (currencySettings.decimalPlaces !== undefined && (currencySettings.decimalPlaces < 0 || currencySettings.decimalPlaces > 8)) {
      return NextResponse.json({ error: 'Decimal places must be between 0 and 8' }, { status: 400 });
    }

    // TODO: Save currency settings to database
    console.log('Updating currency settings for user:', session.user.id, currencySettings);

    return NextResponse.json({
      message: 'Currency settings updated successfully',
      settings: currencySettings
    });
  } catch (error) {
    console.error('Error updating currency settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}