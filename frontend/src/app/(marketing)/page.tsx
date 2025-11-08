"use client";

import { Button } from "@polarix/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton
} from "@polarix/ui/components";
import { useAuthStore } from "@/store/auth-store";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import keycloak from "../../../keycloak";

function SkeletonLoader() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="mt-4 h-6 w-1/2" />
            <Skeleton className="mt-2 h-6 w-2/3" />
            <div className="mt-6 flex space-x-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


export default function MarketingPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <SkeletonLoader />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <header className="container z-40 bg-background">
          <div className="flex h-20 items-center justify-between py-6">
            <div className="flex gap-6 md:gap-10">
              <Link href="/" className="hidden items-center space-x-2 md:flex">
                <span className="hidden font-bold sm:inline-block">
                  Polarix
                </span>
              </Link>
            </div>
            <nav>
              <Button
                onClick={() => {
                  keycloak.login();
                }}
              >
                Login
              </Button>
            </nav>
          </div>
        </header>
        <div className="flex-1">
          <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
              <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
                Where Society Meets Strategy
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Polarix is the ultimate platform for teams that want to combine
                seamless project management with dynamic social collaboration.
              </p>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </section>
          <section
            id="features"
            className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
          >
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                Features
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Everything you need to supercharge your team's productivity and
                collaboration.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Collaborative Projects</CardTitle>
                  <CardDescription>
                    Manage tasks, track progress, and hit deadlines together.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <div className="flex items-start">
                    <Check className="mr-2 mt-1 h-4 w-4" />
                    <p>Task assignments and tracking</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="mr-2 mt-1 h-4 w-4" />
                    <p>Project timelines and milestones</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="mr-2 mt-1 h-4 w-4" />
                    <p>Shared file repositories</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Social Feed</CardTitle>
                  <CardDescription>
                    Stay in the loop with a real-time activity stream.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <div className="flex items-start">
                    <Check className="mr-2 mt-1 h-4 w-4" />
                    <p>Updates on project progress</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="mr-2 mt-1 h-4 w-4" />
                    <p>Team discussions and announcements</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="mr-2 mt-1 h-4 w-4" />
                    <p>Personalized notifications</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Integrated Communication</CardTitle>
                  <CardDescription>
                    Chat, comment, and discuss without leaving your workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <div className="flex items-start">
                    <Check className="mr-2 mt-1 h-4 w-4" />
                    <p>Direct and group messaging</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="mr-2 mt-1 h-4 w-4" />
                    <p>Task-specific comment threads</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="mr-2 mt-1 h-4 w-4" />
                    <p>Seamless video call integrations</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
          <section className="container py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                Start Your Journey with Polarix
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Sign up today and experience a new era of team collaboration. No
                credit card required.
              </p>
              <Button asChild>
                <Link href="/register">Sign Up Now</Link>
              </Button>
            </div>
          </section>
        </div>
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by Vimal. The source code is available on GitHub.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
