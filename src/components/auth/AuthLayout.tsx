import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children }: Props) {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background text-foreground p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl border-border/60 bg-card/80 p-6 shadow-card-elev backdrop-blur sm:p-8">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ekran główny
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Target className="h-7 w-7 text-primary-foreground" />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold leading-none">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {children}
      </Card>
    </main>
  );
}