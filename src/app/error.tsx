
'use client'; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const reportBody = `
    Please describe what you were doing when this error occurred.
    
    -------------------
    Error: ${error.message}
    Digest: ${error.digest || 'N/A'}
    Stack:
    ${error.stack}
    -------------------
    `;

  return (
    <html lang="en">
        <body>
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <CardTitle className="mt-4 font-headline text-2xl">Oops! Something went wrong.</CardTitle>
                        <CardDescription>
                            An unexpected error occurred. We've logged the issue and our team will look into it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="bg-muted p-4 rounded-md text-left text-sm text-muted-foreground overflow-auto max-h-32">
                            <p><strong>Error:</strong> {error.message}</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => reset()} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                             <Button asChild>
                                <a href={`mailto:support@internhub.htu?subject=Application Error Report&body=${encodeURIComponent(reportBody)}`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Report Issue
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </body>
    </html>
  );
}
