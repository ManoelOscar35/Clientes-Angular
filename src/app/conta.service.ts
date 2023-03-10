import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, take, tap } from 'rxjs';
import { Conta } from './conta';

@Injectable({
  providedIn: 'root'
})
export class ContaService {

  readonly url = 'http://localhost:3000/contas';

  private contasSubjects$: BehaviorSubject<Conta[]> = new BehaviorSubject<Conta[]>([]);
  private loaded: boolean = false;

  constructor(private http: HttpClient) { }

  get(): Observable<Conta[]> {
    if(!this.loaded) {
      this.http.get<Conta[]>(this.url)
        .pipe(
          tap((contas) => console.log(contas)),
          delay(1000)
        )
        .subscribe(this.contasSubjects$);
        this.loaded = true;
    }
    return this.contasSubjects$.asObservable();
  }

  add(conta: Conta): Observable<Conta> {
    return this.http.post<Conta>(this.url, conta)
      .pipe(
        (tap((conta: Conta) => this.contasSubjects$.getValue().push(conta)))
      );
  }

  edit(conta: Conta): Observable<Conta> {
    return this.http.put<Conta>(`${this.url}/${conta.id}`, conta)
      .pipe(tap((c) => {
        let contas = this.contasSubjects$.getValue();
        let i = contas.findIndex(c => c.id === conta.id);
        if( i >= 0)
          contas[i].banco = c.banco;
          contas[i].nomeTipo = c.nomeTipo;
          contas[i].numConta = c.numConta;
      }))
  }

  delete(id: any): Observable<any> {
    return this.http.delete<Conta>(`${this.url}/${id}`)
    .pipe(tap(() => {
      let contas = this.contasSubjects$.getValue();
      let i = contas.findIndex(c => c.id === id);
      if( i >= 0)
        contas.splice(i, 1);
    }))
  }
}
