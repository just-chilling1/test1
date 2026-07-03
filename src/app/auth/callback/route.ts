import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const response = NextResponse.redirect(new URL(next, request.url));

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        response.cookies.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        response.cookies.set({ name, value: "", ...options });
                    },
                },
            }
        );

        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                console.error("Code exchange error:", error.message);
                const errorPath = next.startsWith("/reset-password") ? "/reset-password" : "/login";
                const errorUrl = new URL(errorPath, request.url);
                errorUrl.searchParams.set("error", error.message);
                return NextResponse.redirect(errorUrl);
            }
            return response;
        } catch (err: unknown) {
            console.error("Code exchange exception:", err);
            const errorPath = next.startsWith("/reset-password") ? "/reset-password" : "/login";
            const errorUrl = new URL(errorPath, request.url);
            errorUrl.searchParams.set("error", "Failed to verify link. Please try again.");
            return NextResponse.redirect(errorUrl);
        }
    }

    return NextResponse.redirect(new URL("/login", request.url));
}
