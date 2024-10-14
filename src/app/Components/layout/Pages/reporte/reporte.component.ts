import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { MAT_DATE_FORMATS } from '@angular/material/core';
import moment from 'moment';
import * as XLSX from 'xlsx';

import { Reporte } from '../../../../Interfaces/reporte';
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
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrl: './reporte.component.css',
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_DATA_FORMATS
    }
  ]
})
export class ReporteComponent implements OnInit, AfterViewInit {

  formularioFiltro: FormGroup;
  listaVentasReporte: Reporte[] = [];
  columnasTabla: string[] = ["fechaRegistro", "numeroVenta", "tipoPago", "total", "producto", "cantidad", "precio", "totalProducto"];
  dataVentaReporte = new MatTableDataSource(this.listaVentasReporte);
  @ViewChild(MatPaginator) paginacionTabla! : MatPaginator

  constructor(
    private fb: FormBuilder,
    private _ventaServicio: VentaService,
    private _utlidadServicio: UtilidadService
  ) {
    this.formularioFiltro = this.fb.group({
      fechaInicio: ["", Validators.required],
      fechaFin: ["", Validators.required]
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.dataVentaReporte.paginator = this.paginacionTabla;
  }

  BuscarVentas() {
    const _fechaInicio = moment(this.formularioFiltro.value.fechaInicio).format("DD/MM/YYYY");
    const _fechaFin = moment(this.formularioFiltro.value.fechaFin).format("DD/MM/YYYY");

    if(_fechaInicio === "Invalid date" || _fechaFin === "Invalid date") {
      this._utlidadServicio.MostrarAlerta("Debe ingresar ambas fechas", "Oops!");
      return;
    }

    this._ventaServicio.Reporte(
      _fechaInicio,
      _fechaFin
    ).subscribe({
      next: (data) => {
        if(data.status) {
          this.listaVentasReporte = data.value;
          this.dataVentaReporte.data = data.value;
        } else {
          this.listaVentasReporte = [];
          this.dataVentaReporte.data = [];
          this._utlidadServicio.MostrarAlerta("No se encontraron los datos", "Oops!")
        }
      },
      error: (e) => {}
    })
  }

  ExportarExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.listaVentasReporte);

    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "ReporteVentas.xlsx");
  }

}
