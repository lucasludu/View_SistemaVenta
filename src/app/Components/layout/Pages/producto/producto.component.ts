import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ModalProductoComponent } from '../../Modales/modal-producto/modal-producto.component';
import { Producto } from '../../../../Interfaces/producto';
import { ProductoService } from '../../../../Services/producto.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent implements OnInit, AfterViewInit {

  columnasTabla: string[] = ["nombre", "categoria", "stock", "precio", "estado", "acciones"];
  dataInicio:Producto[] = [];
  dataListProductos = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla! : MatPaginator;

  constructor(
    private dialog: MatDialog,
    private _productoServicio: ProductoService,
    private _utlidadServicio: UtilidadService
  ) {}


  ObtenerProductos() {
    this._productoServicio.Lista().subscribe({
      next: (data) => {
        if(data.status) {
          this.dataListProductos.data = data.value;
        } else {
          this._utlidadServicio.MostrarAlerta("No se encontraron datos", "Oops!")
        }
      },
      error: (e) => {}
    })
  }

  ngOnInit(): void {
    this.ObtenerProductos();
  }
  
  ngAfterViewInit(): void {
    this.dataListProductos.paginator = this.paginacionTabla;
  }


  AplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListProductos.filter = filterValue.trim().toLowerCase();
  }

  NuevoProducto() {
    this.dialog.open(ModalProductoComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if(resultado == "true") this.ObtenerProductos();
    });
  }

  EditarProducto(producto: Producto) {
    this.dialog.open(ModalProductoComponent, {
      disableClose: true,
      data: producto
    }).afterClosed().subscribe(resultado => {
      if(resultado == "true") this.ObtenerProductos();
    });
  }

  EliminarProducto(producto: Producto) {
    Swal.fire({
      title: "¿Desea eliminar el producto?",
      text: producto.nombre,
      icon: "warning",
      confirmButtonColor: "#3085D6",
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor: "#D33",
      cancelButtonText: "No, volver"
    }).then((resultado) => {
      if(resultado.isConfirmed) {
        this._productoServicio.Eliminar(producto.idProducto).subscribe({
          next: (data) => {
            if(data.status) {
              this._utlidadServicio.MostrarAlerta("El producto fue eliminado", "Listo!");
              this.ObtenerProductos();
            } else {
              this._utlidadServicio.MostrarAlerta("No se pudo eliminar el producto", "Error");
            }
          },
          error: (e) => {}
        })
      }
    })
  }

}
