import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all todos
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 },
    );
  }
}

// POST a new todo
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Todo text is required" },
        { status: 400 },
      );
    }

    const todo = await prisma.todo.create({
      data: {
        text: text.trim(),
        completed: false,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 },
    );
  }
}
