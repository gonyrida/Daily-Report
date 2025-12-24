import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ResourceRow {
  id: string;
  description: string;
  unit?: string;
  prev: number;
  today: number;
  accumulated: number;
}

interface ResourceTableProps {
  title: string;
  icon: React.ReactNode;
  rows: ResourceRow[];
  setRows: (rows: ResourceRow[]) => void;
  showUnit?: boolean;
}

const ResourceTable = ({ title, icon, rows, setRows, showUnit = false }: ResourceTableProps) => {
  const addRow = () => {
    const newRow: ResourceRow = {
      id: crypto.randomUUID(),
      description: "",
      unit: showUnit ? "" : undefined,
      prev: 0,
      today: 0,
      accumulated: 0,
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, field: keyof ResourceRow, value: string | number) => {
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          if (field === "prev" || field === "today") {
            const prev = field === "prev" ? Number(value) : row.prev;
            const today = field === "today" ? Number(value) : row.today;
            updatedRow.accumulated = prev + today;
          }
          return updatedRow;
        }
        return row;
      })
    );
  };

  return (
    <div className="section-card overflow-hidden animate-fade-in">
      <div className="bg-table-header px-4 py-3 border-b border-table-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Row
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-4 py-2.5 text-sm font-medium text-muted-foreground w-[40%]">
                Description
              </th>
              {showUnit && (
                <th className="text-center px-4 py-2.5 text-sm font-medium text-muted-foreground w-[12%]">
                  Unit
                </th>
              )}
              <th className="text-center px-4 py-2.5 text-sm font-medium text-muted-foreground w-[12%]">
                Prev
              </th>
              <th className="text-center px-4 py-2.5 text-sm font-medium text-muted-foreground w-[12%]">
                Today
              </th>
              <th className="text-center px-4 py-2.5 text-sm font-medium text-muted-foreground w-[12%]">
                Accum
              </th>
              <th className="w-[8%]"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr key="empty-row">
                <td colSpan={showUnit ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  No entries yet. Click "Add Row" to begin.
                </td>
              </tr>
            ) : (
              <>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-table-border hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2">
                      <Input
                        value={row.description}
                        onChange={(e) => updateRow(row.id, "description", e.target.value)}
                        placeholder="Enter description..."
                        className="border-0 bg-transparent focus-visible:ring-1"
                      />
                    </td>
                    {showUnit && (
                      <td className="px-3 py-2">
                        <Input
                          value={row.unit || ""}
                          onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                          placeholder="Unit"
                          className="border-0 bg-transparent text-center focus-visible:ring-1"
                        />
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={row.prev || ""}
                        onChange={(e) => updateRow(row.id, "prev", Number(e.target.value) || 0)}
                        className="border-0 bg-transparent text-center focus-visible:ring-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={row.today || ""}
                        onChange={(e) => updateRow(row.id, "today", Number(e.target.value) || 0)}
                        className="border-0 bg-transparent text-center focus-visible:ring-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-center font-semibold text-primary">
                        {row.accumulated}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(row.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr key="total-row" className="border-t-2 border-primary/30 bg-primary/5">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    Total
                  </td>
                  {showUnit && <td></td>}
                  <td className="px-3 py-3 text-center font-bold text-foreground">
                    {rows.reduce((sum, row) => sum + row.prev, 0)}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-foreground">
                    {rows.reduce((sum, row) => sum + row.today, 0)}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-primary">
                    {rows.reduce((sum, row) => sum + row.accumulated, 0)}
                  </td>
                  <td></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceTable;
