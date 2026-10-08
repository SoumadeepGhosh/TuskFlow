'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useInvitationByToken,
  useAcceptInvitation,
  useDeclineInvitation,
} from '@/hooks/api/use-workspaces';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  LogIn,
  Mail,
  Shield,
  UserCheck,
  XCircle,
} from 'lucide-react';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const { token } = React.use(params);
  const router = useRouter();

  const { data: invitation, isLoading, isError } = useInvitationByToken(token);
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();

  const handleAccept = () => {
    acceptMutation.mutate(token, {
      onSuccess: (data) => {
        const targetId = data?.workspaceId || invitation?.workspaceId;
        if (targetId) {
          router.push(`/workspaces/${targetId}`);
        } else {
          router.push('/workspaces');
        }
      },
    });
  };

  const handleDecline = () => {
    declineMutation.mutate(token, {
      onSuccess: () => {
        router.push('/workspaces');
      },
    });
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <div className="w-full max-w-md bg-card border border-border rounded-[24px] p-8 space-y-6 shadow-soft">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-3 pt-4 border-t border-border">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <div className="w-full max-w-md bg-card border border-border rounded-[24px] p-8 text-center space-y-5 shadow-soft">
          <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <XCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-foreground">
              Invalid or Expired Invitation
            </h2>
            <p className="text-sm text-muted-foreground">
              This invitation link is not valid or has been removed. Please check the URL or request a new invitation from your workspace administrator.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/workspaces">
              <Button variant="outline" className="w-full">
                Go to Workspaces
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpired =
    invitation.status === 'EXPIRED' ||
    new Date(invitation.expiresAt) < new Date();
  const isAccepted = invitation.status === 'ACCEPTED';
  const isDeclined = invitation.status === 'DECLINED';
  const isCancelled = invitation.status === 'CANCELLED';

  const userEmailMatches =
    isAuthenticated &&
    user?.email?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-lg bg-card border border-border rounded-[24px] p-8 space-y-6 shadow-soft">
        {/* Workspace Brand Icon */}
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {invitation.workspace?.name || 'Workspace'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Workspace Invitation
            </p>
          </div>
        </div>

        {/* Invitation Info Box */}
        <div className="rounded-[18px] bg-secondary/50 border border-border/80 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Invited Email
            </span>
            <span className="font-semibold text-foreground truncate max-w-[220px]">
              {invitation.email}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Assigned Role
            </span>
            <Badge variant="secondary" className="capitalize text-[11px] font-semibold">
              {invitation.role.toLowerCase()}
            </Badge>
          </div>

          {invitation.inviter && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" /> Invited By
              </span>
              <span className="font-semibold text-foreground truncate max-w-[220px]">
                {invitation.inviter.name || invitation.inviter.email}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Expires
            </span>
            <span className="text-muted-foreground">
              {new Date(invitation.expiresAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* State-specific Content & Actions */}
        {isAccepted ? (
          <div className="text-center space-y-4 pt-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full">
              <CheckCircle2 className="h-4 w-4" /> This invitation has been accepted
            </div>
            <Link href={`/workspaces/${invitation.workspaceId}`} className="block">
              <Button className="w-full">Open Workspace</Button>
            </Link>
          </div>
        ) : isExpired ? (
          <div className="text-center space-y-4 pt-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 rounded-full">
              <AlertCircle className="h-4 w-4" /> This invitation has expired
            </div>
            <p className="text-xs text-muted-foreground">
              Please contact the workspace administrator to request a new invitation.
            </p>
            <Link href="/workspaces" className="block">
              <Button variant="outline" className="w-full">
                Go to Workspaces
              </Button>
            </Link>
          </div>
        ) : isDeclined || isCancelled ? (
          <div className="text-center space-y-4 pt-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-secondary px-3.5 py-1.5 rounded-full">
              <XCircle className="h-4 w-4" />
              {isDeclined ? 'Invitation declined' : 'Invitation cancelled'}
            </div>
            <Link href="/workspaces" className="block">
              <Button variant="outline" className="w-full">
                Go to Workspaces
              </Button>
            </Link>
          </div>
        ) : !isAuthenticated ? (
          /* User Not Logged In */
          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3.5 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <LogIn className="h-3.5 w-3.5 text-primary" /> Sign in required
              </p>
              <p>
                To accept this invitation, please sign in or create an account with{' '}
                <span className="font-medium text-foreground">{invitation.email}</span>.
              </p>
            </div>

            <div className="space-y-2">
              <Link href={`/login?redirect=/invite/${token}`} className="block">
                <Button className="w-full gap-2">
                  <LogIn className="h-4 w-4" /> Sign In to Accept
                </Button>
              </Link>
              <Link href={`/register?redirect=/invite/${token}`} className="block">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        ) : !userEmailMatches ? (
          /* User logged in with different account */
          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-600 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Different Account Detected
              </div>
              <p className="text-muted-foreground">
                You are currently logged in as{' '}
                <span className="font-semibold text-foreground">{user?.email}</span>.
                This invitation is intended for{' '}
                <span className="font-semibold text-foreground">{invitation.email}</span>.
              </p>
            </div>

            <div className="space-y-2">
              <Link href={`/login?redirect=/invite/${token}`} className="block">
                <Button variant="outline" className="w-full">
                  Switch Account
                </Button>
              </Link>
              <Link href="/workspaces" className="block">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  Cancel & Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Authenticated and Matching Email -> Ready to Accept/Decline */
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleAccept}
              isLoading={acceptMutation.isPending}
              disabled={declineMutation.isPending}
              className="w-full gap-2 font-semibold h-11"
            >
              <CheckCircle2 className="h-4 w-4" /> Accept Invitation
            </Button>

            <Button
              variant="outline"
              onClick={handleDecline}
              isLoading={declineMutation.isPending}
              disabled={acceptMutation.isPending}
              className="w-full text-muted-foreground hover:text-destructive"
            >
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

