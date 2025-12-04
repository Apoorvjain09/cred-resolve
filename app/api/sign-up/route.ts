import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email & password are required" },
                { status: 400 }
            );
        }

        const hash = await bcrypt.hash(password, 10);

        const userId = crypto.randomUUID();

        const { error: userError } = await supabase
            .from("users")
            .insert({
                id: userId,
                email,
                password_hash: hash,
            });

        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 400 });
        }

        const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
                user_id: userId,
                role: role,
            });

        if (roleError) {
            return NextResponse.json({ error: roleError.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Signup successful",
            user: { id: userId, email, role: role },
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Something went wrong" },
            { status: 500 }
        );
    }
}