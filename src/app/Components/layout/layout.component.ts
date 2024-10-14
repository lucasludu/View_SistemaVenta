import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { Menu } from '../../Interfaces/menu';
import { MenuService } from '../../Services/menu.service';
import { UtilidadService } from '../../Reutilizable/utilidad.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {

  listaMenus: Menu[] = [];
  correoUsuario: string = "";
  rolUsuario: string = "";

  constructor(
    private router : Router,
    private _menuServicio : MenuService,
    private _utilidadServicio : UtilidadService
  ) {}


  ngOnInit(): void {
    const usuario = this._utilidadServicio.ObtenerSesionUsuario();

    if(usuario != null) {
      this.correoUsuario = usuario.correo;
      this.rolUsuario = usuario.rolDescripcion;

      this._menuServicio.Lista(usuario.idUsuario).subscribe({
        next: (data) => {
          if(data.status) {
            this.listaMenus = data.value;
          }
        },
        error: (e) => {}
      })
    }
  }



  CerrarSesion() {
    this._utilidadServicio.EliminarSesionUsuario();
    this.router.navigate(["login"]);
  }

}
