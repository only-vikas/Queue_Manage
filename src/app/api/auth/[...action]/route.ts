import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Manager from "@/models/Manager";
import { signJWT, getAuthCookieOptions, AUTH_COOKIE_NAME, getSession } from "@/lib/auth";


const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  workspaceName: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params;
  const actionType = action?.[0]?.toLowerCase();

  await connectDB();

  if (actionType === "signup") {
    try {
      const body = await req.json();
      const parsed = signupSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { name, email, password, workspaceName } = parsed.data;

      const existing = await Manager.findOne({ email });
      if (existing) {
        return NextResponse.json(
          { error: "A manager with this email already exists" },
          { status: 409 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const manager = await Manager.create({
        name,
        email,
        passwordHash,
        workspaceName: workspaceName || "Rugas Desk",
      });

      const token = await signJWT({
        managerId: manager._id.toString(),
        email: manager.email,
        name: manager.name,
        workspaceName: manager.workspaceName,
      });

      const response = NextResponse.json(
        {
          success: true,
          manager: {
            id: manager._id.toString(),
            name: manager.name,
            email: manager.email,
            workspaceName: manager.workspaceName,
          },
        },
        { status: 201 }
      );

      const cookieOpts = getAuthCookieOptions();
      response.cookies.set(cookieOpts.name, token, cookieOpts);

      return response;
    } catch (err: unknown) {
      console.error("Signup error:", err);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }
  }

  if (actionType === "login") {
    try {
      const body = await req.json();
      const parsed = loginSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { email, password } = parsed.data;

      const manager = await Manager.findOne({ email }).select("+passwordHash");
      if (!manager) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(password, manager.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = await signJWT({
        managerId: manager._id.toString(),
        email: manager.email,
        name: manager.name,
        workspaceName: manager.workspaceName,
      });

      const response = NextResponse.json(
        {
          success: true,
          manager: {
            id: manager._id.toString(),
            name: manager.name,
            email: manager.email,
            workspaceName: manager.workspaceName,
          },
        },
        { status: 200 }
      );

      const cookieOpts = getAuthCookieOptions();
      response.cookies.set(cookieOpts.name, token, cookieOpts);

      return response;
    } catch (err: unknown) {
      console.error("Login error:", err);
      return NextResponse.json(
        { error: "Failed to login" },
        { status: 500 }
      );
    }
  }

  if (actionType === "logout") {
    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json({ error: `Unknown auth action: ${actionType}` }, { status: 404 });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params;
  const actionType = action?.[0]?.toLowerCase();

  if (actionType === "me" || actionType === "session") {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, manager: null }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      manager: {
        id: session.managerId,
        name: session.name,
        email: session.email,
        workspaceName: session.workspaceName,
      },
    });
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
