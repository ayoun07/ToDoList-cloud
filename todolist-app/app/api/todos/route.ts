import { NextRequest, NextResponse } from "next/server";
import { initTodosTable, pool } from "@/lib/db";

interface TodoApi {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

async function formatTodoRow(row: {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}): Promise<TodoApi> {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

export async function GET() {
  await initTodosTable();
  const result = await pool.query(
    "SELECT id, text, completed, created_at FROM todos ORDER BY created_at DESC",
  );

  const todos = await Promise.all(result.rows.map(formatTodoRow));
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const text = String(body?.text ?? "").trim();

  if (!text) {
    return NextResponse.json(
      { error: "Le texte de la tâche est requis" },
      { status: 400 },
    );
  }

  await initTodosTable();
  const id =
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const result = await pool.query(
    "INSERT INTO todos (id, text, completed) VALUES ($1, $2, $3) RETURNING id, text, completed, created_at",
    [id, text, false],
  );

  const todo = await formatTodoRow(result.rows[0]);
  return NextResponse.json(todo, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const id = String(body?.id ?? "").trim();
  const completed = body?.completed;

  if (!id || typeof completed !== "boolean") {
    return NextResponse.json(
      { error: "L’identifiant et le statut de complétion sont requis" },
      { status: 400 },
    );
  }

  await initTodosTable();
  const result = await pool.query(
    "UPDATE todos SET completed = $2 WHERE id = $1 RETURNING id, text, completed, created_at",
    [id, completed],
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });
  }

  const todo = await formatTodoRow(result.rows[0]);
  return NextResponse.json(todo);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const id = String(body?.id ?? "").trim();

  if (!id) {
    return NextResponse.json(
      { error: "L’identifiant est requis" },
      { status: 400 },
    );
  }

  await initTodosTable();
  await pool.query("DELETE FROM todos WHERE id = $1", [id]);
  return new NextResponse(null, { status: 204 });
}
