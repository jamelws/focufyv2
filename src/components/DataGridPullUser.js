// components/DataGridPullUser.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';

const DataGridPullUser = () => {
  const [rowData, setRowData] = useState([]);

  const columns = [
    { field: 'id', headerName: 'ID', sortable: true, filter: true, width: 100 },
    { field: 'usuariold', headerName: 'User ID (Sistema)', sortable: true, filter: true },
    { field: 'nombre', headerName: 'Nombre (Externo)', sortable: true, filter: true, editable: true, flex: 1 },
    { field: 'correo', headerName: 'Correo (Externo)', sortable: true, filter: true, editable: true, flex: 1 },
  ];

  useEffect(() => {
    // Fetch data from /api/usuarios
    // fetch('/api/usuarios').then(res => res.json()).then(data => setRowData(data));
    
    // Datos de prueba hasta que la API esté implementada
    setRowData([
      { id: 1, usuariold: null, nombre: "Juan Externo", correo: "juan@test.com" },
      { id: 2, usuariold: "uuid-123", nombre: "Maria Interna", correo: "maria@focufy.com" },
    ]);
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestión de PullUsers (Extras)
        </Typography>
        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columns}
            pagination={true}
            paginationPageSize={20}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DataGridPullUser;