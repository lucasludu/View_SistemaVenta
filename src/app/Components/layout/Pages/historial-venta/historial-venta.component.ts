import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { MAT_DATE_FORMATS } from '@angular/material/core';
import moment from 'moment';

import { ModalDetalleVentaComponent } from '../../Modales/modal-detalle-venta/modal-detalle-venta.component';

import { Venta } from '../../../../Interfaces/venta';
import { VentaService } from '../../../../Services/venta.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';


export const MY_DATA_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY"
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMMM YYYY"
  }
}

@Component({
  selector: 'app-historial-venta',
  templateUrl: './historial-venta.component.html',
  styleUrl: './historial-venta.component.css',
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_DATA_FORMATS
    }
  ]
})
export class HistorialVentaComponent implements OnInit, AfterViewInit {

  formularioBusqueda: FormGroup;
  opcionesBusqueda: any[] = [
    {
      value: "fecha",
      descripcion: "Por fechas"
    },
    {
      value: "numero",
      descripcion: "Numero venta"
    }
  ];
  columnasTabla: string[] = ["fechaRegistro", "numeroDocumento", "tipoPago", "total", "accion"];
  dataInicio: Venta[] = [];
  datosListaVenta = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla! : MatPaginator;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _ventaServicio: VentaService,
    private _utlidadServicio: UtilidadService
  ) {
    this.formularioBusqueda = this.fb.group({
      buscaPor: ["fecha"],
      numero: [""],
      fechaInicio: [""],
      fechaFin: [""],
    })

    this.formularioBusqueda.get("buscaPor")?.valueChanges.subscribe(value => {
      this.formularioBusqueda.patchValue({
        numero: "",
        fechaInicio: "",
        fechaFin: ""
      })
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.datosListaVenta.paginator = this.paginacionTabla;
  }

  AplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datosListaVenta.filter = filterValue.trim().toLowerCase();
  }

  BuscarVentas() {
    let _fechaInicio: string = "";
    let _fechaFin: string = "";

    if(this.formularioBusqueda.value.buscaPor === "fecha") {
      _fechaInicio = moment(this.formularioBusqueda.value.fechaInicio).format("DD/MM/YYYY");
      _fechaFin = moment(this.formularioBusqueda.value.fechaFin).format("DD/MM/YYYY");

      if(_fechaInicio === "Invalid date" || _fechaFin === "Invalid date") {
        this._utlidadServicio.MostrarAlerta("Debe ingresar ambas fechas", "Oops!");
        return;
      }
    }

    this._ventaServicio.Historial(
      this.formularioBusqueda.value.buscaPor,
      this.formularioBusqueda.value.numero,
      _fechaInicio,
      _fechaFin
    ).subscribe({
      next: (data) => {
        if(data.status) {
          this.datosListaVenta = data.value;
        } else {
          this._utlidadServicio.MostrarAlerta("No se encontraron datos", "Oops!");
        }
      },
      error: (e) => {}
    });
  }

  VerDetalleVenta(_venta: Venta) {
    this.dialog.open(ModalDetalleVentaComponent, {
      data: _venta,
      disableClose: true,
      width: "700px"
    })
  }


}
