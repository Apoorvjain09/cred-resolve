"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function SignForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("student");
    const router = useRouter();

    async function handleSignup(e: any) {
        e.preventDefault();
        setLoading(true);

        const email = (document.getElementById("email") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        const res = await fetch("/api/sign-up", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            alert(data.error || "Signup failed");
            return;
        }

        router.push(`/dashboard/${role}`);
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Signup to your account</h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your details to create your account
                    </p>
                </div>

                {/* EMAIL */}
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                </Field>

                {/* PASSWORD */}
                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" required />
                </Field>

                {/* ROLE DROPDOWN */}
                <Field>
                    <FieldLabel>Select Role</FieldLabel>

                    <Select onValueChange={(value) => setRole(value)} defaultValue="student">
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                {/* BUTTON */}
                <Field>
                    <Button type="submit" onClick={handleSignup} disabled={loading}>
                        {loading ? "Signing Up..." : "Sign Up"}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    );
}