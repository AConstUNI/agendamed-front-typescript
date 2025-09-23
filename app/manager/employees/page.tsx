'use client'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Switch, TextField, Typography } from "@mui/material"
import { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid"
import { useState } from "react";

export default function EmployeesRegistration() {
  const [open, setOpen] = useState(false)
  const [manager, setManager] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'license', headerName: 'Cod. Licença', width: 70 },
    { field: 'name', headerName: 'Nome', width: 130 },
  ];

  const rows = [
    { id: 1, name: 'Snow', license: "1" },
    { id: 2, name: 'Lannister', license: "42" },
    { id: 3, name: 'Lannister',  license: "45" },
    { id: 4, name: 'Stark', license: "16" },
    { id: 5, name: 'Targaryen', license: "32" },
    { id: 6, name: 'Melisandre', license: "150" },
    { id: 7, name: 'Clifford', license: "44" },
    { id: 8, name: 'Frances', license: "36" },
    { id: 9, name: 'Roxie', license: "65" },
  ];
  return(
    <Box>
      <Button variant="outlined" onClick={() => { setOpen(true) }}>Cadastrar Funcionário</Button>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Cadastro de Funcionário"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <FormControl fullWidth>
              <TextField
              label="Nome"
              variant="filled"
              margin="normal"
              type="email"
              autoComplete="email"
              required
              fullWidth
              />
              <Typography>Médico<Switch value={manager} onChange={(event, checked) => {setManager(checked)}}/>Gerente</Typography> 
              {manager ?
                <TextField 
                label="Telefone"
                type="tel"
                variant="filled"
                margin="normal"
                fullWidth
                />
              :
                <TextField
                label="Código da Licença"
                type="number"
                variant="filled"
                margin="normal"
                required
                fullWidth
                /> 
              }
            </FormControl>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {}}>Limpar</Button>
          <Button onClick={() => {}} autoFocus>
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 