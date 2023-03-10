import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pipe, Subject, takeUntil } from 'rxjs';
import { Conta } from '../conta';
import { ContaService } from '../conta.service';

@Component({
  selector: 'app-conta',
  templateUrl: './conta.component.html',
  styleUrls: ['./conta.component.css']
})
export class ContaComponent implements OnInit {

  banco: string = '';
  nomeTipo: string = '';
  numConta: string = '';
  id: any;
  contaEditar = false;
  contas: Conta[] = [];
  private unsubscribe$: Subject<any> = new Subject();

  constructor(
    private contaService: ContaService,
    private snackBar: MatSnackBar
    
  ) { }

  ngOnInit() {
    this.contaService.get().pipe( takeUntil(this.unsubscribe$)).subscribe({
      next: (c: Conta[]) => { this.contas = c}
    })
  }

  save(): void {
    if(this.contaEditar) {
      this.contaService.edit({id: this.id, banco: this.banco, nomeTipo: this.nomeTipo, numConta: this.numConta}).subscribe({
        next: (conta: Conta) => {
          this.clearFields(),
          this.ngOnInit(),
          this.notify('Atualizado!')

        },
        error: (err: any) => {
          this.notify('Erro ao atualizar!'),
          console.error(err)
        }
      });
    } else {
      this.contaService.add({banco: this.banco, nomeTipo: this.nomeTipo, numConta: this.numConta})
        .subscribe({
          next: (c: Conta) => {
            console.log(c),
            this.clearFields();
            this.notify('Adicionado!');
          },
          error: (err: any) => { 
            this.notify('Erro ao adicionar!'),
            console.error(err)
          }
        });
    }
 }

  clearFields(): void {
    this.banco = '';
    this.nomeTipo = '';
    this.numConta = '';
    this.id = '';
    this.contaEditar = false;
  }

  cancel(): void {
    this.clearFields();
  }

  edit(banco: string, contaTipo: string, id: string, numConta: string) {
    this.banco = banco;
    this.nomeTipo = contaTipo;
    this.numConta = numConta;
    this.id = id;
    this.contaEditar = true;
    
  }
  
  delete(id: string): void {
    this.contaService.delete(id).subscribe({
      next: () => {
        this.notify('Removido!')
      },
      error: (err) => console.error(err)
    });
  }

  notify(msg: string): void {
    this.snackBar.open(msg, 'OK', {duration: 3000});
  }

  ngOnDestroy() {
    this.unsubscribe$.next(()=>{});
  }

}
