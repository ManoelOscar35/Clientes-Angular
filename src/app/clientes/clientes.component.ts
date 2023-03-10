import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import { ClientesService } from '../clientes.service';
import { Clientes } from '../clientes';
import { Conta } from '../conta';
import { ContaService } from '../conta.service';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  clientes: Clientes[] = [];
  contas: Conta[] = [];
  clienteEditar: boolean = false;
  unsubscribe$: Subject<any> = new Subject<any>();

  clientesForm: FormGroup = this.fb.group({
    id: [null],
    nome: [null, [Validators.required, Validators.min(4), Validators.max(50)]],
    cpf: [null, [Validators.required]],
    idade: [null, [Validators.required]],
    contas: [[], [Validators.required]],
  });

  @ViewChild('form') form: any;

  constructor(
    private clientesService: ClientesService,
    private fb: FormBuilder,
    private contasService: ContaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.clientesService.get()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: (clientes) => this.clientes = clientes 
      });
    this.contasService.get()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: (contas) => this.contas = contas
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next([]);
  }

  save() {
      let data = this.clientesForm.value;
      if(this.clienteEditar) {
      this.clientesService.edit(data).subscribe({
        next: (cliente) =>  { 
          console.log(cliente),
          this.ngOnInit(),
          this.notify("Atualizado!")
        },
        error: () => this.notify("Erro ao atualizar, tente novamente!")
      });
    } else {
      this.clientesService.add(data).subscribe({
        next: (cliente) => {
          console.log(cliente),
          this.ngOnInit();
          this.notify("Adicionado!")
        },
        error: () => this.notify("Erro ao adicionar, tente novamente!")
      });
    }

    this.resetForm();
  }

  edit(cliente: Clientes) {
    console.log(cliente)
    this.clienteEditar = true;
    this.clientesForm.patchValue({
      id: cliente.id,
      nome: cliente.nome,
      cpf: cliente.cpf,
      idade: cliente.idade,
      contas: cliente.contas
    })

  }

  delete(c: Clientes) {
    this.clientesService.delete(c).subscribe({
      next: () => this.notify("Deletado!"),
      error: () => this.notify("Erro ao deletar, tente novamente!") 
    })
  }

  notify(msg: string) {
    this.snackBar.open(msg, "OK!", {duration: 3000});
  }

  resetForm() {
    //this.clientesForm.reset();
    this.form.resetForm();
  }
}
