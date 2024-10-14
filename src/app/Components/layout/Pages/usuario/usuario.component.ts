import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ModalUsuarioComponent } from '../../Modales/modal-usuario/modal-usuario.component';
import { Usuario } from '../../../../Interfaces/usuario';
import { UsuarioService } from '../../../../Services/usuario.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit, AfterViewInit{

  columnasTabla: string[] = ["nombreCompleto", "correo", "rolDescripcion", "estado", "acciones"];
  dataInicio:Usuario[] = [];
  dataListUsuario = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla! : MatPaginator;


  constructor(
    private dialog: MatDialog,
    private _usuarioServicio: UsuarioService,
    private _utlidadServicio: UtilidadService
  ) {}
  

  ObtenerUsuarios() {
    this._usuarioServicio.Lista().subscribe({
      next: (data) => {
        if(data.status) {
          this.dataListUsuario.data = data.value;
        } else {
          this._utlidadServicio.MostrarAlerta("No se encontraron datos", "Oops!")
        }
      },
      error: (e) => {}
    })
  }
  
  ngOnInit(): void {
    this.ObtenerUsuarios();
  }
  
  ngAfterViewInit(): void {
    this.dataListUsuario.paginator = this.paginacionTabla;
  }

  AplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListUsuario.filter = filterValue.trim().toLowerCase();
  }

  NuevoUsuario() {
    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if(resultado == "true") this.ObtenerUsuarios();
    });
  }

  EditarUsuario(usuario: Usuario) {
    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true,
      data: usuario
    }).afterClosed().subscribe(resultado => {
      if(resultado == "true") this.ObtenerUsuarios();
    });
  }

  EliminarUsuario(usuario: Usuario) {
    Swal.fire({
      title: "¿Desea eliminar el usuario?",
      text: usuario.nombreCompleto,
      icon: "warning",
      confirmButtonColor: "#3085D6",
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor: "#D33",
      cancelButtonText: "No, volver"
    }).then((resultado) => {
      if(resultado.isConfirmed) {
        this._usuarioServicio.Eliminar(usuario.idUsuario).subscribe({
          next: (data) => {
            if(data.status) {
              this._utlidadServicio.MostrarAlerta("El usuario fue eliminado", "Listo!");
              this.ObtenerUsuarios();
            } else {
              this._utlidadServicio.MostrarAlerta("No se pudo eliminar el usuario", "Error");
            }
          },
          error: (e) => {}
        })
      }
    })
  }

}
