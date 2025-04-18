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
  ViewSurveillance
} from "../components";
import axios from 'axios';
import { toast } from "sonner";

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
    accessorKey: "LicenseNumber",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        License Number
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("LicenseNumber")}</div>
  },
  {
    accessorKey: "RestaurantName",
    header: "Restaurant Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("RestaurantName")}</div>
  },
  {
    accessorKey: "OwnerFirstName",
    header: "Owner First Name",
    cell: ({ row }) => <div>{row.getValue("OwnerFirstName")}</div>
  },
  {
    accessorKey: "OwnerLastName",
    header: "Owner Last Name",
    cell: ({ row }) => <div>{row.getValue("OwnerLastName")}</div>
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
    accessorKey: "RegistrationNumber",
    header: "Registration Number",
    cell: ({ row }) => <div>{row.getValue("RegistrationNumber")}</div>
  },
  {
    accessorKey: "LastUpdated",
    header: "Last Updated",
    cell: ({ row }) => <div>{new Date(row.getValue("LastUpdated")).toLocaleString()}</div>
  },
  {
    accessorKey: "RegistrationDate",
    header: "Registration Date",
    cell: ({ row }) => <div>{new Date(row.getValue("RegistrationDate")).toLocaleString()}</div>
  }
];

export default function RestaurantList() {
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
    const getRestaurants = async () => {
      try {
        const { data: res } = await api.get("/restaurant/");  // Updated API endpoint based on data structure
        console.log(res.data);
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error retrieving vehicles:", error);
        setLoading(false);
      }
    };

    getRestaurants();
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

  const handleStartSurveillence = () => {
    axios.post('http://localhost:8000/start-tracking', '', {
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      console.log('Success:', response.data);
      toast.success("Tracking started successfully!");
    })
    .catch(error => {
      console.error('Error:', response?.data);
      toast.error(error?.response?.data?.message || error.message);
    });
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
            placeholder="Filter license numbers..."
            value={table.getColumn("LicenseNumber")?.getFilterValue() || ""}
            onChange={(event) => table.getColumn("LicenseNumber")?.setFilterValue(event.target.value)}
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
            <Button variant="outline" size="sm" onClick={handleStartSurveillence}>
              `Start`Surveillence and device management
            </Button>
            <Button variant="outline" size="sm" onClick={handleCheckFines}>
              Check Surveillence
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
      <ViewSurveillance
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        selectedRow={selectedRow}
        key={new Date().getTime()}
      />
    </div>
  );
}
