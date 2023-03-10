import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, combineLatestAll, filter, forkJoin, map, Observable, pipe, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Clientes } from './clientes';
import { ContaService } from './conta.service';
import { Conta } from './conta';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  readonly url = "http://localhost:3000/clientes";
  private clientesSubjects$: BehaviorSubject<Clientes[]> = new BehaviorSubject<Clientes[]>([]);
  private loaded: boolean = false;

  constructor(
    private http: HttpClient,
    private contaService: ContaService
  ) {}

  get(): Observable<Clientes[]> {
    if(!this.loaded) { 
      combineLatest([
        this.http.get<Clientes[]>(this.url),
        this.contaService.get()
      ])
      .pipe(
        tap(([clientes, contas]) => console.log(clientes, contas)),
        filter(([clientes, contas]) => clientes != null && contas != null),
        map(([clientes, contas]) => {
          for(let c of clientes) {
            let ids = c.contas as string[];
            c.contas = ids.map((id) => contas.find(conta => conta.id == id));
          }
          return clientes;
        }),
        tap((clientes) => console.log(clientes))
      ).subscribe(this.clientesSubjects$);
        this.loaded = true;
    }
    return this.clientesSubjects$.asObservable();
  }

  add(cliente: Clientes): Observable<Clientes> {
    let contas = (cliente.contas as Conta[]).map(c => c.id);
    console.log(contas);
    return this.http.post<Clientes>(this.url, {...cliente, contas})
      .pipe(
        tap(c => {
          this.clientesSubjects$.getValue().push({...cliente, id: c.id})
        })
      )
  }

  delete(cliente: Clientes): Observable<any> {
    return this.http.delete(`${this.url}/${cliente.id}`)
      .pipe(
        tap(() => {
          let clientes = this.clientesSubjects$.getValue();
          let i = clientes.findIndex(c => c.id === cliente.id);
          if(i >= 0)
            clientes.splice(i, 1);
        })
      )
  }
  
  edit(cliente: Clientes): Observable<Clientes> {
    let contas = (cliente.contas as Conta[]).map(c => c.id);
    console.log(contas)
    return this.http.put<Clientes>(`${this.url}/${cliente.id}`, {...cliente, contas})
      .pipe(
        tap(() => {
          let clientes = this.clientesSubjects$.getValue();
          let i = clientes.findIndex(c => c.id === cliente.id);
          console.log(i)
          if(i >= 0)
            clientes[i] = cliente;
        })
      )
  }

 

}