import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { Building } from "@db/schema";
import { SYSTEM_CONTROLS, type SystemControl } from "@/lib/constants";

type BuildingControlProps = {
  buildingId: number;
};

export function BuildingControls({ buildingId }: BuildingControlProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: building } = useQuery<Building>({
    queryKey: [`/api/buildings/${buildingId}`],
  });

  const controlMutation = useMutation({
    mutationFn: async ({ system, state }: { system: SystemControl; state: boolean }) => {
      const response = await fetch(`/api/buildings/${buildingId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, state }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update control");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/buildings/${buildingId}`] });
      toast({
        title: "Success",
        description: "Building control updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update building control",
        variant: "destructive",
      });
    },
  });

  if (!building) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Building Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(SYSTEM_CONTROLS).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="font-medium">{key}</span>
            <Switch
              checked={building.status[value.toLowerCase() as SystemControl]}
              onCheckedChange={(checked) =>
                controlMutation.mutate({
                  system: value.toLowerCase() as SystemControl,
                  state: checked,
                })
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
