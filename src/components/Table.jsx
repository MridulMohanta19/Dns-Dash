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
  TextField,
  Box,
  IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const baseURL = process.env.REACT_APP_BASE_URL;

export default function DataTable() {
  
  const [data, setData] = useState([]);
  const [domainID, setDomainID] = useState("");
  const [domainData, setDomainData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRecord, setNewRecord] = useState({ type: "", name: "", value: "", ttl: "" });

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
        recordId: record.RecordId, // Assuming record has a unique identifier
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

  const handleDeleteRecord = useCallback(async (recordId) => {
    try {
      const response = await fetch(`${baseURL}/domain/delete-record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: domainID,
          recordId,
        }),
      });

      if (response.ok) {
        // Refresh the records after deletion
        getRecords();
      } else {
        console.error("Error deleting record:", response.statusText);
      }
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  }, [domainID, getRecords]);

  const handleAddRecord = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/domain/add-record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: domainID,
          record: newRecord,
        }),
      });

      if (response.ok) {
        // Refresh the records after adding a new one
        getRecords();
        setNewRecord({ type: "", name: "", value: "", ttl: "" });
      } else {
        console.error("Error adding record:", response.statusText);
      }
    } catch (err) {
      console.error("Error adding record:", err);
    }
  }, [domainID, newRecord, getRecords]);

  const filteredData = data.filter((row) =>
    row.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { field: "name", headerName: "Name", width: 250 },
    { field: "type", headerName: "Type", width: 130 },
    { field: "value", headerName: "Value", width: 350 },
    { field: "ttl", headerName: "TTL", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <IconButton
          color="secondary"
          onClick={() => handleDeleteRecord(params.row.recordId)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    getRecords();
  }, [getRecords]);

  useEffect(() => {
    getDomain();
  }, [getDomain]);

  return (
    <div style={{ height: 800, width: "100%" }}>
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
      <Box
        component="form"
        sx={{ mt: 4, display: "flex", justifyContent: "space-around", alignItems: "center" }}
        onSubmit={(e) => {
          e.preventDefault();
          handleAddRecord();
        }}
      >
        <Typography variant="h5" sx={{ flexBasis: "10%" }}>Add DNS Record</Typography>
        <FormControl variant="standard" sx={{ width: "15%" }}>
          <InputLabel id="record-type-label">Type</InputLabel>
          <Select
            labelId="record-type-label"
            id="record-type"
            value={newRecord.type}
            onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
            fullWidth
          >
            {/* Add all necessary DNS record types here */}
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="AAAA">AAAA</MenuItem>
            <MenuItem value="CNAME">CNAME</MenuItem>
            <MenuItem value="MX">MX</MenuItem>
            <MenuItem value="TXT">TXT</MenuItem>
            {/* Add other DNS record types as needed */}
          </Select>
        </FormControl>
        <TextField
          label="Name"
          variant="standard"
          sx={{ width: "15%" }}
          value={newRecord.name}
          onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
        />
        <TextField
          label="Value"
          variant="standard"
          sx={{ width: "15%" }}
          value={newRecord.value}
          onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
        />
        <TextField
          label="TTL"
          variant="standard"
          type="number"
          sx={{ width: "15%" }}
          value={newRecord.ttl}
          onChange={(e) => setNewRecord({ ...newRecord, ttl: e.target.value })}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ width: "10%" }}
        >
          Add Record
        </Button>
      </Box>
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
