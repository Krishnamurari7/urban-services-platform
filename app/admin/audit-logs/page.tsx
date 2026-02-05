"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Info, Eye } from "lucide-react";
import { format } from "date-fns";
import type { AdminAction } from "@/lib/types/database";

interface AuditLogExtended extends AdminAction {
    profiles: {
        full_name: string;
    };
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLogExtended[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAction, setFilterAction] = useState<string>("all");
    const [selectedLog, setSelectedLog] = useState<AuditLogExtended | null>(null);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            let query = supabase
                .from("admin_actions")
                .select(`
          *,
          profiles:admin_id (
            full_name
          )
        `)
                .order("created_at", { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            setLogs(data as AuditLogExtended[]);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.target_id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterAction === "all" || log.action_type === filterAction;

        return matchesSearch && matchesFilter;
    });

    const getActionBadgeColor = (type: string) => {
        switch (type) {
            case "user_suspended":
            case "service_deleted":
            case "booking_cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            case "user_activated":
            case "service_created":
                return "bg-green-100 text-green-700 border-green-200";
            case "service_updated":
            case "payment_refunded":
                return "bg-blue-100 text-blue-700 border-blue-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">
                        Track all administrative actions performed across the platform.
                    </p>
                </div>
                <Button onClick={fetchAuditLogs} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search description, admin, or target ID..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Select value={filterAction} onValueChange={setFilterAction}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Action Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="user_suspended">User Suspended</SelectItem>
                                    <SelectItem value="user_activated">User Activated</SelectItem>
                                    <SelectItem value="service_created">Service Created</SelectItem>
                                    <SelectItem value="service_updated">Service Updated</SelectItem>
                                    <SelectItem value="service_deleted">Service Deleted</SelectItem>
                                    <SelectItem value="booking_cancelled">Booking Cancelled</SelectItem>
                                    <SelectItem value="payment_refunded">Payment Refunded</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No audit logs found matching your criteria.
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Admin</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {log.profiles?.full_name || "Unknown Admin"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getActionBadgeColor(log.action_type)}>
                                                    {log.action_type.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                                                        {log.target_type || "N/A"}
                                                    </span>
                                                    <span className="text-xs truncate w-24" title={log.target_id || ""}>
                                                        {log.target_id?.slice(0, 8) || "N/A"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {log.description}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail View Modal (Simplified as a side-car or just bottom section for now) */}
            {selectedLog && (
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Log Details</CardTitle>
                            <CardDescription>
                                Detailed information for log ID {selectedLog.id}
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                            Close
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground">User Agent</h4>
                                    <p className="text-sm break-all">{selectedLog.user_agent || "Not recorded"}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground">IP Address</h4>
                                    <p className="text-sm">{selectedLog.ip_address || "Not recorded"}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground">Metadata</h4>
                                    <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                                        {JSON.stringify(selectedLog.metadata, null, 2) || "No metadata"}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
