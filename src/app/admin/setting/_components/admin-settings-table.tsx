"use client";

import { useRouter } from "next/navigation";
import type { SettingRow } from "@/modules/admin/settings/schemas";
import type { SessionUser } from "@/modules/auth/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminSettingsTableProps {
  session: SessionUser;
  settings: SettingRow[];
}

export function AdminSettingsTable({ settings }: AdminSettingsTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Application key-value configuration
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Serialized</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No settings found
                </TableCell>
              </TableRow>
            )}
            {settings.map((setting) => (
              <TableRow
                key={setting.setting_uuid}
                className="cursor-pointer"
                onClick={() => router.push(`/admin/setting/${setting.setting_uuid}`)}
              >
                <TableCell className="font-mono text-xs">{setting.code}</TableCell>
                <TableCell className="font-mono text-xs">{setting.key}</TableCell>
                <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">
                  {setting.value ?? <span className="italic">null</span>}
                </TableCell>
                <TableCell>
                  {setting.serialized ? (
                    <Badge variant="secondary">JSON</Badge>
                  ) : (
                    <Badge variant="outline">Plain</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {setting.updated_at
                    ? new Date(setting.updated_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/setting/${setting.setting_uuid}`);
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
