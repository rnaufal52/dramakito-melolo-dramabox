import { NextRequest, NextResponse } from 'next/server';
import { dracinApi } from '@/lib/api';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        const results = await dracinApi.search(query, 1);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
