import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email & password are required" },
                { status: 400 }
            );
        }

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 400 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 400 }
            );
        }

        const { data: roles, error: rolesError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);

        if (rolesError) {
            return NextResponse.json({ error: rolesError.message }, { status: 400 });
        }

        const roleList = roles?.map((r) => r.role) ?? [];

        return NextResponse.json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                roles: roleList,
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Something went wrong" },
            { status: 500 }
        );
    }
}