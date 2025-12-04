"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: any) {
        e.preventDefault();
        setLoading(true);

        const email = (document.getElementById("email") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            alert(data.error || "Login failed");
            return;
        }

        const roles: string[] = data.user.roles;

        let redirectTo = "/";

        if (roles.includes("super_admin")) redirectTo = "/dashboard/super_admin";
        else if (roles.includes("admin")) redirectTo = "/dashboard/admin";
        else if (roles.includes("teacher")) redirectTo = "/dashboard/teacher";
        else if (roles.includes("student")) redirectTo = "/dashboard/student";
        else if (roles.includes("parent")) redirectTo = "/dashboard/parent";
        else if (roles.includes("staff")) redirectTo = "/dashboard/staff";

        // Redirect user
        router.push(redirectTo);
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Login to your account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your email below to login to your account
                    </p>
                </div>

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                </Field>

                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" required />
                </Field>

                <Field>
                    <Button type="submit" onClick={handleLogin} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </Field>

                <Field>
                    <FieldDescription className="text-center">
                        Don't have an account?{" "}
                        <a href="/sign-up" className="underline underline-offset-4">
                            Sign up
                        </a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    );
}