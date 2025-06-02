
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw } from "lucide-react";
import { supabaseStationsService, StationAnalytics } from "@/services/supabaseStationsService";
import { useToast } from "@/hooks/use-toast";

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<StationAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await supabaseStationsService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <Card className="w-full bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Station Analytics
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {analytics.length === 0 ? (
          <div className="text-center p-6 bg-background/50 rounded-lg">
            <p className="text-muted-foreground">No analytics data available yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station ID</TableHead>
                  <TableHead>Play Count</TableHead>
                  <TableHead>Total Play Time</TableHead>
                  <TableHead>Last Played</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-mono text-sm">{stat.station_id.slice(0, 8)}...</TableCell>
                    <TableCell>{stat.play_count}</TableCell>
                    <TableCell>{formatPlayTime(stat.total_play_time)}</TableCell>
                    <TableCell>{new Date(stat.last_played_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAnalytics;
