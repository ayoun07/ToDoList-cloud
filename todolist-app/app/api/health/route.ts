import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Tester la connexion à la base de données
    const count = await prisma.todo.count();

    return NextResponse.json({
      status: "OK",
      message: "Database connection successful",
      todoCount: count,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
