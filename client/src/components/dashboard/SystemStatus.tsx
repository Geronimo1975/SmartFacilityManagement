import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Building } from "@db/schema";

type SystemStatusProps = {
  buildingId: number;
};

export function SystemStatus({ buildingId }: SystemStatusProps) {
  const { data: building, isLoading } = useQuery<Building>({
    queryKey: [`/api/buildings/${buildingId}`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!building) return null;

  const systemStatus = Object.entries(building.status).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value ? 100 : 0,
    }),
    {} as Record<string, number>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(systemStatus).map(([system, value]) => (
          <div key={system} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium capitalize">{system}</span>
              <span>{value}%</span>
            </div>
            <Progress value={value} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
