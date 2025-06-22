import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Filter, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { Dispute, User } from "../../../shared/schema";

interface DisputeWithRelations extends Dispute {
  business: User | null;
  referrer: User | null;
  admin: User | null;
}

function getStatusBadgeClass(status: string | null) {
  if (!status) return "status-badge";
  switch (status) {
    case "pending":
      return "status-badge status-pending";
    case "approved":
      return "status-badge status-approved";
    case "rejected":
      return "status-badge status-rejected";
    case "escalated":
      return "status-badge status-escalated";
    default:
      return "status-badge";
  }
}

function formatDate(date: string | Date | null) {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function DisputeResolution() {
  const { data: disputes = [], isLoading } = useQuery<DisputeWithRelations[]>({ 
    queryKey: ["disputes"], 
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          business:businessId(*),
          referrer:referrerId(*),
          admin:adminId(*)
        `);

      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const pendingDisputes = disputes.filter(d => d.status === 'pending');
  const resolvedDisputes = disputes.filter(d => d.status !== 'pending');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dispute Resolution</h1>
          <p className="text-gray-600">Review and resolve cases requiring administrative attention</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Link href="/analytics">
            <Button size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>
          </Link>
        </div>
      </div>

      {/* Cases Requiring Attention */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Cases Requiring Attention</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select defaultValue="date-newest">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-newest">Date (Newest)</SelectItem>
                  <SelectItem value="date-oldest">Date (Oldest)</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Business Claim</TableHead>
                <TableHead>Referrer Response</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-mono text-sm">{dispute.caseId}</TableCell>
                  <TableCell>{formatDate(dispute.createdAt)}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{dispute.business?.username}</div>
                    <div className="text-sm text-gray-600">{dispute.businessClaim}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{dispute.referrerResponse}</div>
                    <Button variant="link" className="text-blue-500 text-sm p-0 h-auto">
                      View evidence
                    </Button>
                  </TableCell>
                  <TableCell>
                    {dispute.status &&
                    <Badge className={getStatusBadgeClass(dispute.status)}>
                      {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                    </Badge>}
                  </TableCell>
                  <TableCell>
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">Approve referral</SelectItem>
                        <SelectItem value="reject">Reject referral</SelectItem>
                        <SelectItem value="more-info">Request more info</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recently Resolved Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Resolved Cases</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resolvedDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-mono text-sm">{dispute.caseId}</TableCell>
                  <TableCell>{formatDate(dispute.resolvedAt)}</TableCell>
                  <TableCell>{dispute.business?.username}</TableCell>
                  <TableCell>{dispute.referrer?.username}</TableCell>
                  <TableCell>
                    {dispute.decision &&
                      <Badge className={getStatusBadgeClass(dispute.decision)}>
                        {dispute.decision.charAt(0).toUpperCase() + dispute.decision.slice(1)}
                      </Badge>
                    }
                  </TableCell>
                  <TableCell>{dispute.admin?.username}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
