import React, { useState, useCallback, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Select,
  FormControl,
  MenuItem,
  Typography,
  InputLabel,
  InputBase,
} from "@mui/material";

const baseURL = process.env.REACT_APP_BASE_URL;

export default function DataTable() {
  
  const [data, setData] = useState([]);
  const [domainID, setDomainID] = useState("");
  const [domainData, setDomainData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (event) => {
    setDomainID(event.target.value);
  };

  const getDomain = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/domain/get-domain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseData = await response.json();
      setDomainData(responseData);
    } catch (err) {
      console.error("Error fetching domains:", err);
    }
  }, []);

  const getRecords = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/domain/get-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: domainID,
        }),
      });

      const responseData = await response.json();
      // Extracting relevant data from responseData and transforming it into rows
      const rows = responseData.map((record, index) => ({
        id: index + 1,
        name: record.Name,
        type: record.Type,
        value: record.ResourceRecords.map((resource) => resource.Value).join(
          ", "
        ),
        ttl: record.TTL,
      }));
      setData(rows);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  }, [domainID]);

  const handleDelete = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/domain/delete-domain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostedZoneId: domainID,
        }),
      });

      if (response.ok) {
        // Refresh the domains after deletion
        getDomain();
        setDomainID("");
        setData([]); // Clear the records data
      } else {
        console.error("Error deleting hosted zone:", response.statusText);
      }
    } catch (err) {
      console.error("Error deleting hosted zone:", err);
    }
  }, [domainID, getDomain]);

  const filteredData = data.filter((row) =>
    row.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { field: "name", headerName: "Name", width: 300 },
    { field: "type", headerName: "Type", width: 130 },
    { field: "value", headerName: "Value", width: 550 },
    { field: "ttl", headerName: "TTL", width: 100 },
    //   {field :'action', headerName: 'ACTION', width: 100}
  ];

  useEffect(() => {
    getRecords();
  }, [getRecords]);

  useEffect(() => {
    getDomain();
  }, [getDomain]);

  return (
    <div style={{ height: 400, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 20 }}>
        <FormControl variant="standard" sx={{ flexBasis: "70%", m: 1 }}>
          <InputLabel id="demo-simple-select-standard-label">
            Domain Name
          </InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={domainID}
            onChange={handleChange}
            label="Domain Name"
            fullWidth
          >
            {domainData?.map((d) => {
              const parts = d.Id.split("/");
              const extractedValue = parts[parts.length - 1];
              return (
                <MenuItem key={extractedValue} value={extractedValue}>
                  {d.Name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Button
          onClick={handleDelete}
          sx={{ flexBasis: "30%", m: 1, color: "white" }}
          variant="contained"
          color="primary"
        >
          Delete Zone
        </Button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 20 }}>
        <InputBase
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            flexBasis: "100%",
            p: "0.5rem",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        />
      </div>
      <div style={{ margin: 30 }}>
        <Typography
          variant="h2"
          style={{ fontWeight: "bold", textAlign: "center" }}
        >
          HOSTED ZONES
        </Typography>
      </div>
      <DataGrid
        rows={filteredData}
        columns={columns}
        pageSize={5}
        pagination
        checkboxSelection
      />
    </div>
  );
}
