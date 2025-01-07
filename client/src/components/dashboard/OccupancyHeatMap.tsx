import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { useOccupancy } from '@/hooks/use-occupancy';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { updateOccupancy, isConnected } = useOccupancy(buildingId);

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

  const getColor = (value: number) => {
    const maxOccupancy = 50;
    const intensity = Math.min((value / maxOccupancy) * 255, 255);
    return `rgb(255, ${255 - intensity}, 0)`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Occupancy Heat Map</CardTitle>
          <AnimatePresence>
            {!isConnected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center p-4 min-h-[400px]"
            >
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading occupancy data...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full overflow-x-auto"
            >
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
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-background p-2 rounded shadow-lg border"
                        >
                          <p>Zone: {data.zone}</p>
                          <p>Occupancy: {data.z}</p>
                        </motion.div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}