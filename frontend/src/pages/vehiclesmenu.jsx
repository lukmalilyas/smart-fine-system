"use client";

import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import api from "../libs/apiCall"; // Ensure the correct path to your api.js file
import {
  ViewFines
} from "../components";

// Column definitions
export const columns = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "LicensePlate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        License Plate
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("LicensePlate")}</div>
  },
  {
    accessorKey: "VehicleType",
    header: "Vehicle Type",
    cell: ({ row }) => <div className="capitalize">{row.getValue("VehicleType")}</div>
  },
  {
    accessorKey: "VehicleModel",
    header: "Vehicle Model",
    cell: ({ row }) => <div>{row.getValue("VehicleModel")}</div>
  },
  {
    accessorKey: "VehicleColour",
    header: "Vehicle Colour",
    cell: ({ row }) => <div>{row.getValue("VehicleColour")}</div>
  },
  {
    accessorKey: "FirstName",
    header: "Owner First Name",
    cell: ({ row }) => <div>{row.getValue("FirstName")}</div>
  },
  {
    accessorKey: "LastName",
    header: "Owner Last Name",
    cell: ({ row }) => <div>{row.getValue("LastName")}</div>
  },
  {
    accessorKey: "PhoneNumber",
    header: "Phone Number",
    cell: ({ row }) => <div>{row.getValue("PhoneNumber")}</div>
  },
  {
    accessorKey: "Address",
    header: "Address",
    cell: ({ row }) => <div>{row.getValue("Address")}</div>
  },
  {
    accessorKey: "District",
    header: "District",
    cell: ({ row }) => <div>{row.getValue("District")}</div>
  },
  {
    accessorKey: "NIC",
    header: "NIC",
    cell: ({ row }) => <div>{row.getValue("NIC")}</div>
  },
  {
    accessorKey: "ChassisNumber",
    header: "Chassis Number",
    cell: ({ row }) => <div>{row.getValue("ChassisNumber")}</div>
  },
  {
    accessorKey: "EngineNumber",
    header: "Engine Number",
    cell: ({ row }) => <div>{row.getValue("EngineNumber")}</div>
  }
];

export default function VehiclesMenu() {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection }
  });

  // Fetch vehicle data
  useEffect(() => {
    const getVehicles = async () => {
      try {
        const { data: res } = await api.get("/vehicles/");
        console.log(res.data);
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error retrieving vehicle:", error);
        setLoading(false);
      }
    };

    getVehicles();
  }, []);

  const handleRowClick = (row) => {
    const isSelected = row.getIsSelected();
    if (isSelected) {
      // Unselect the row if it's already selected
      row.toggleSelected(false);
    } else {
      // Select the row if it's not selected
      setRowSelection({ [row.id]: true });
      setSelectedRow(row);
    }
  };
  

  const handleCheckFines = () => {
    if (selectedRow) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full mt-30 bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter license plates..."
            value={table.getColumn("LicensePlate")?.getFilterValue() || ""}
            onChange={(event) => table.getColumn("LicensePlate")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => handleRowClick(row)} // Handle row click to select
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handleCheckFines}>
              Check fines
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for displaying row details */}

    <ViewFines
    isOpen={isModalOpen}
    setIsOpen={setIsModalOpen}
    selectedRow={selectedRow}
    key={new Date().getTime()}
    />
    
    </div>

  );
}
