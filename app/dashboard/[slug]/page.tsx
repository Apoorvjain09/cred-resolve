import { Button } from "@/components/ui/button";
import Link from "next/link";

const VALID_ROLES = [
    "super_admin",
    "admin",
    "teacher",
    "student",
    "parent",
    "staff",
];

export default async function RoleDashboard({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const role = slug;

    console.log("ROLE:", role);

    if (!VALID_ROLES.includes(role)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-6">
                <h1 className="text-3xl font-bold text-red-600">404 — Page Not Found</h1>
                <p className="text-lg">This dashboard does not exist.</p>

                <Link
                    href="/login"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                >
                    Go back to Login Page
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-6">
            <h1 className="text-3xl font-bold">
                Welcome to the <span className="text-primary">{role}</span> dashboard
            </h1>

            <Link
                href="/login"
            >
                <Button className="p-8 text-lg">
                    {"< "}Go back to Login Page
                </Button>
            </Link>
        </div>
    );
}