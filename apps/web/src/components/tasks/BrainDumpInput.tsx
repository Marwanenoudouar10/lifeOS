import { useState, useMemo } from 'react';
import { useBrainDump } from '@/hooks/use-tasks';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Brain, Loader2, Sparkles, X, RotateCcw } from 'lucide-react';

interface ParsedLine {
  raw: string;
  title: string;
}

export function BrainDumpInput() {
  const [text, setText] = useState('');
  const brainDump = useBrainDump();

  const parsedLines = useMemo<ParsedLine[]>(() => {
    if (!text.trim()) return [];
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => ({
        raw: line,
        title: line.replace(/^[-*]\s*/, '').trim(),
      }));
  }, [text]);

  const handleProcess = async () => {
    if (parsedLines.length === 0) {
      toast.error('Enter at least one task');
      return;
    }

    try {
      const entries = parsedLines.map((line) => ({ raw: line.raw }));
      await brainDump.mutateAsync(entries);
      toast.success(`${parsedLines.length} task${parsedLines.length > 1 ? 's' : ''} created`);
      setText('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to process brain dump');
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Brain Dump</CardTitle>
        </div>
        <CardDescription>
          Quickly capture tasks -- one per line. We will process and organize them for you.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input area */}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Type your tasks, one per line...\n\nExamples:\n- Buy groceries\n- Finish quarterly report by Friday\n- Call dentist to schedule appointment\n- Review PR for the new feature`}
          rows={8}
          className="font-mono text-sm resize-none"
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleProcess}
            disabled={parsedLines.length === 0 || brainDump.isPending}
          >
            {brainDump.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Process {parsedLines.length > 0 && `(${parsedLines.length})`}
          </Button>

          {text.trim() && (
            <>
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4" />
                Clear
              </Button>
              <Button
                variant="ghost"
                onClick={() => setText('')}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </>
          )}

          <span className="ml-auto text-xs text-muted-foreground">
            {parsedLines.length} task{parsedLines.length !== 1 ? 's' : ''} detected
          </span>
        </div>

        {/* Preview */}
        {parsedLines.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Preview</h4>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {parsedLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground font-mono w-5 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-sm flex-1">{line.title}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      New
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
