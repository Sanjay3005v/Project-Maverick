
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, Trophy, Medal } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LeaderboardPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    const fetchTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      setTrainees(fetchedTrainees);
      setLoading(false);
    };

    fetchTrainees();
  }, []);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  const topPerformers = useMemo(() => {
    return trainees
      .filter(trainee => departmentFilter === 'all' || trainee.department === departmentFilter)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 10);
  }, [trainees, departmentFilter]);
  
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
        return <Badge className="gap-1.5 bg-yellow-400 text-yellow-900 hover:bg-yellow-500 w-24 justify-center"><Medal className="h-4 w-4" /> 1st Place</Badge>
    }
    if (rank === 2) {
        return <Badge className="gap-1.5 bg-slate-400 text-slate-900 hover:bg-slate-500 w-24 justify-center"><Medal className="h-4 w-4" /> 2nd Place</Badge>
    }
    if (rank === 3) {
        return <Badge className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 w-24 justify-center"><Medal className="h-4 w-4" /> 3rd Place</Badge>
    }
    return <Badge variant="secondary" className="w-24 justify-center">{rank}th</Badge>
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Top Performers</h1>
        <p className="text-muted-foreground">Leaderboard of the top 10 trainees based on progress.</p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>
                  <Trophy className="mr-2 h-6 w-6 text-primary" />
                  Leaderboard
              </CardTitle>
              <CardDescription>
                  This leaderboard showcases the trainees who are leading the cohort in their onboarding progress.
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No trainees found for this department.</TableCell>
                    </TableRow>
                )}
                {topPerformers.map((trainee, index) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-bold text-lg">{getRankBadge(index + 1)}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={trainee.avatarUrl} data-ai-hint="person avatar" />
                                <AvatarFallback>{getInitials(trainee.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{trainee.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{trainee.department}</TableCell>
                    <TableCell className="text-right font-bold text-xl text-primary">{trainee.progress}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-12">
        <Link href="/trainee/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
