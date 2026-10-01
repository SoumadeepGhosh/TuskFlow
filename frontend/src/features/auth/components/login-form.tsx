'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas/auth.schema';
import { useLoginMutation } from '../hooks/use-auth-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function LoginForm() {
  const { mutate: login, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="4" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email and password to access your workspaces
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="alex@taskflow.dev"
              autoComplete="email"
              disabled={isPending}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isPending}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full mt-2 font-semibold"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="text-white" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border pt-6 pb-6 text-sm text-muted-foreground">
          <span>Don&apos;t have an account?</span>
          <Link
            href="/register"
            className="ml-1.5 font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
