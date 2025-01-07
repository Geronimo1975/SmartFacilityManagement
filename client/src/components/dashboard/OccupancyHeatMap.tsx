import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { useOccupancy } from '@/hooks/use-occupancy';
import { Loader2 } from 'lucide-react';

type OccupancyData = {
  id: number;
  buildingId: number;
  zone: string;
  occupancyCount: number;
  timestamp: string;
};

type HeatMapProps = {
  buildingId: number;
  width?: number;
  height?: number;
};

export function OccupancyHeatMap({ buildingId, width = 600, height = 400 }: HeatMapProps) {
  const { updateOccupancy } = useOccupancy(buildingId);
  
  const { data: occupancyData, isLoading } = useQuery<OccupancyData[]>({
    queryKey: ['/api/buildings', buildingId, 'occupancy'],
  });

  const processedData = useMemo(() => {
    if (!occupancyData) return [];

    return occupancyData.map((data) => {
      const [x, y] = data.zone.split('-').map(Number);
      return {
        x,
        y,
        z: data.occupancyCount,
        zone: data.zone,
      };
    });
  }, [occupancyData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const getColor = (value: number) => {
    const maxOccupancy = 50;
    const intensity = Math.min((value / maxOccupancy) * 255, 255);
    return `rgb(255, ${255 - intensity}, 0)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy Heat Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <ScatterChart width={width} height={height} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis type="number" dataKey="x" name="X Position" />
            <YAxis type="number" dataKey="y" name="Y Position" />
            <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Occupancy" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background p-2 rounded shadow-lg border">
                      <p>Zone: {data.zone}</p>
                      <p>Occupancy: {data.z}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={processedData} shape="circle">
              {processedData.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.z)} />
              ))}
            </Scatter>
          </ScatterChart>
        </div>
      </CardContent>
    </Card>
  );
}
