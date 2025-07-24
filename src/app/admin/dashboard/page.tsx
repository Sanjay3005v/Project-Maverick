import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, AlertTriangle, Timer, Search, Wand2 } from "lucide-react";
import Link from "next/link";
import { ReportDialog } from "@/components/report-dialog";

const freshers = [
  { id: 1, name: "Alice Johnson", department: "Engineering", progress: 75, status: "On Track" },
  { id: 2, name: "Bob Williams", department: "Engineering", progress: 45, status: "Needs Attention" },
  { id: 3, name: "Charlie Brown", department: "Product", progress: 90, status: "Exceeding" },
  { id: 4, name: "Diana Miller", department: "Design", progress: 60, status: "On Track" },
  { id: 5, name: "Ethan Davis", department: "Engineering", progress: 20, status: "At Risk" },
];

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">Admin Console</h1>
        <p className="text-muted-foreground">Monitor and manage trainee onboarding.</p>
      </header>
      
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">+10 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Latency</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120ms</div>
            <p className="text-xs text-muted-foreground">API response time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rates</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.5%</div>
            <p className="text-xs text-muted-foreground">Across all services</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Trainee Management</CardTitle>
            <CardDescription>Search, filter, and view progress of all trainees.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search by name..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 w-full md:w-auto">
                <Link href="/admin/onboarding-plan" className="w-full md:w-auto">
                    <Button variant="outline" className="w-full">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Onboarding Planner
                    </Button>
                </Link>
                <ReportDialog trainees={freshers} />
              </div>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {freshers.map((fresher) => (
                    <TableRow key={fresher.id}>
                      <TableCell className="font-medium">{fresher.name}</TableCell>
                      <TableCell>{fresher.department}</TableCell>
                      <TableCell>
                        <Badge variant={
                          fresher.status === 'On Track' ? 'secondary' :
                          fresher.status === 'Exceeding' ? 'default' :
                          'destructive'
                        }>{fresher.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                           <span className="text-sm text-muted-foreground w-8">{fresher.progress}%</span>
                           <Progress value={fresher.progress} className="w-32" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
