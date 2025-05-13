// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { GetCategories, CreateCategory } from "@/actions/categories";

export async function GET(request: Request) {
  try {
    const categories = await GetCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const category = await CreateCategory(name);
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
