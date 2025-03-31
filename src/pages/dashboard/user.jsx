import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";

// Import jsPDF and autoTable correctly
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function Tables() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/customers-users")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setCustomers(response.data);
        } else {
          console.error("Expected an array but got:", response.data);
          setCustomers([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
        setCustomers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const exportToPDF = () => {
    // Create new jsPDF instance
    const doc = new jsPDF();

    // Add title
    doc.text("Customers List", 14, 15);

    // Prepare data for the table
    const tableData = customers.map((customer) => [
      `${customer.firstName} ${customer.lastName}`,
      customer.email,
      customer.role,
      new Date(customer.createdAt).toLocaleDateString(),
    ]);

    // Generate the table using autoTable
    autoTable(doc, {
      head: [["Name", "Email", "Role", "Created At"]],
      body: tableData,
      startY: 20,
      styles: {
        cellPadding: 2,
        fontSize: 10,
        valign: "middle",
        halign: "left",
      },
      headStyles: {
        fillColor: [128, 128, 128],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Save the PDF
    doc.save("customers-list.pdf");
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="red">{error}</Typography>;
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Customers Table
          </Typography>
          <Button
            color="white"
            size="sm"
            onClick={exportToPDF}
            className="flex items-center gap-2"
          >
            Export to PDF
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Name", "Email", "Role", "Created At", ""].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map(
                ({ id, firstName, lastName, email, role, createdAt }, key) => {
                  const className = `py-3 px-5 ${
                    key === customers.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={id}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {`${firstName} ${lastName}`}
                            </Typography>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {email}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={role === "customer" ? "green" : "blue-gray"}
                          value={role}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {new Date(createdAt).toLocaleDateString()}
                        </Typography>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Tables;
