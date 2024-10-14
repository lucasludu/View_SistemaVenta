import { Component, Inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Categoria } from '../../../../Interfaces/categoria';
import { Producto } from '../../../../Interfaces/producto';
import { CategoriaService } from '../../../../Services/categoria.service';
import { ProductoService } from '../../../../Services/producto.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-producto',
  templateUrl: './modal-producto.component.html',
  styleUrl: './modal-producto.component.css'
})
export class ModalProductoComponent implements OnInit {

  formularioProducto: FormGroup;
  tituloAccion:string = "Agregar";
  botonAccion:string = "Guardar";
  listaCategoria:Categoria[] = [];

  constructor(
    private modalActual:MatDialogRef<ModalProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public datosProducto: Producto,
    private fb: FormBuilder,
    private _categoriaServicio: CategoriaService,
    private _productoServicio: ProductoService,
    private _utilidadServicio: UtilidadService
  ) {

    this.formularioProducto = this.fb.group({
      nombre: ["", Validators.required],
      idCategoria: ["", Validators.required],
      stock: ["", Validators.required],
      precio: ["", Validators.required],
      esActivo: ['1', Validators.required],
    });

    if(this.datosProducto != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    this._categoriaServicio.Lista().subscribe({
      next: (data) => {
        if(data.status) this.listaCategoria = data.value;
      },
      error: (e) => {}
    })

  }

  ngOnInit(): void {
    if(this.datosProducto != null) {
      this.formularioProducto.patchValue({
        nombre: this.datosProducto.nombre,
        idCategoria: this.datosProducto.idCategoria,
        stock: this.datosProducto.stock,
        precio: this.datosProducto.precio,
        esActivo: this.datosProducto.esActivo.toString()
      });
    }
  }


  GuardarEditar_Producto() {
    const _producto: Producto = {
      idProducto: this.datosProducto == null ? 0 : this.datosProducto.idProducto,
      nombre: this.formularioProducto.value.nombre,
      idCategoria: this.formularioProducto.value.idCategoria,
      descripcionCategoria:"",
      precio: this.formularioProducto.value.precio,
      stock: this.formularioProducto.value.stock,
      esActivo: parseInt(this.formularioProducto.value.esActivo),
    }

    if(this.datosProducto == null) {
      this._productoServicio.Guardar(_producto).subscribe({
        next: (data) => {
          if(data.status) {
            this._utilidadServicio.MostrarAlerta("El producto fue registrado", "Exito");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.MostrarAlerta("No se pudo registrar el producto", "Error");
          }
        },
        error: (e) => {}
      });
    } else {
      this._productoServicio.Editar(_producto).subscribe({
        next: (data) => {
          if(data.status) {
            this._utilidadServicio.MostrarAlerta("El producto fue editado", "Exito");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.MostrarAlerta("No se pudo editar el producto", "Error");
          }
        },
        error: (e) => {}
      });
    }
  }



}
